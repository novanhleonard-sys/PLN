CREATE OR REPLACE FUNCTION start_ai_process_run(
    p_version_id UUID,
    p_scope process_run_scope,
    p_config_snapshot JSONB
)
RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
BEGIN
    INSERT INTO ai_process_runs (story_version_id, scope, config_snapshot, status)
    VALUES (p_version_id, p_scope, p_config_snapshot, 'queued')
    RETURNING id INTO v_run_id;

    -- Update story_versions status to processing ONLY IF it's generating text
    IF p_scope = 'all' OR p_scope = 'text_only' THEN
        UPDATE story_versions SET status = 'processing' WHERE id = p_version_id;
    END IF;

    -- Update asset_status to generating if it involves assets
    IF p_scope != 'text_only' THEN
        UPDATE story_versions SET asset_status = 'generating' WHERE id = p_version_id;
    END IF;

    IF p_scope = 'all' OR p_scope = 'text_only' THEN
        INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
        VALUES ('segment', 'story_version', p_version_id, v_run_id, 'run_' || v_run_id || '_segment');
    ELSIF p_scope = 'image_only' THEN
        INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
        VALUES ('story-visual-bible', 'version', p_version_id, v_run_id, 'run_' || v_run_id || '_bible');
    ELSIF p_scope = 'audio_only' THEN
        -- Normally we would queue audio jobs for all pages, but we just queue a trigger job for now or rely on an audio queue job
        -- Note: audio jobs are per page, so we need a master job if we want to kick them off cleanly.
        -- We'll just leave this as is for now.
    END IF;

    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
