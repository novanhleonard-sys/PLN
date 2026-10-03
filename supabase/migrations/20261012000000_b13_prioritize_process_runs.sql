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
          COALESCE(pr.created_at, j.created_at) ASC,
          j.created_at ASC
        LIMIT p_limit
        FOR UPDATE OF j SKIP LOCKED
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
