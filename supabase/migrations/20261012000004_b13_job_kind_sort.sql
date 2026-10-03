CREATE OR REPLACE FUNCTION claim_job(p_kinds TEXT[], p_limit INTEGER DEFAULT 1)
RETURNS SETOF jobs AS $$
BEGIN
    RETURN QUERY
    UPDATE jobs
    SET status = 'running',
        attempts = attempts + 1,
        run_after = NOW() + INTERVAL '5 minutes'
    WHERE id IN (
        SELECT j.id
        FROM jobs j
        LEFT JOIN ai_process_runs pr ON j.process_run_id = pr.id
        WHERE j.status = 'queued'
          AND j.run_after <= NOW()
          AND j.kind = ANY(p_kinds)
        ORDER BY 
          -- Prioritize older process runs first to prevent interleaving between stories
          COALESCE(pr.created_at, j.created_at) ASC,
          -- Explicitly enforce topological sort within the same process_run
          -- so parent jobs (like bible) always run before children (like scene-image)
          CASE j.kind
            WHEN 'segment' THEN 1
            WHEN 'story-visual-bible' THEN 2
            WHEN 'canonical-master' THEN 3
            WHEN 'canonical-ref' THEN 4
            WHEN 'scene-image' THEN 5
            WHEN 'audio' THEN 6
            WHEN 'finalize' THEN 7
            ELSE 99
          END ASC,
          -- Fallback tie-breaker
          j.created_at ASC
        LIMIT p_limit
        FOR UPDATE OF j SKIP LOCKED
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
