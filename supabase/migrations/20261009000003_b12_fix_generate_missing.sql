CREATE OR REPLACE FUNCTION start_ai_process_run(
    p_version_id UUID,
    p_scope process_run_scope,
    p_config_snapshot JSONB
)
RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
    v_is_missing_only BOOLEAN;
BEGIN
    v_is_missing_only := COALESCE((p_config_snapshot->>'source') = 'admin_generate_missing', false);

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
        IF v_is_missing_only THEN
            -- Generate missing scene images directly
            INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
            SELECT 'scene-image', 'scene', s.id, v_run_id, 'run_' || v_run_id || '_scene_' || s.id
            FROM scenes s
            WHERE s.version_id = p_version_id AND s.image_path IS NULL;
        ELSE
            -- Generate visual bible which will queue all scene images
            INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
            VALUES ('story-visual-bible', 'version', p_version_id, v_run_id, 'run_' || v_run_id || '_bible');
        END IF;
    ELSIF p_scope = 'audio_only' THEN
        IF v_is_missing_only THEN
            -- Queue audio jobs ONLY for pages missing audio
            INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
            SELECT 'audio', 'page', p.id, v_run_id, 'audio_' || v_run_id || '_' || p.id
            FROM pages p
            JOIN adaptations a ON p.adaptation_id = a.id
            LEFT JOIN page_audio pa ON pa.page_id = p.id
            WHERE a.version_id = p_version_id AND a.age_band = 'asli' AND pa.id IS NULL;
        ELSE
            -- Queue audio jobs for all pages
            INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
            SELECT 'audio', 'page', p.id, v_run_id, 'audio_' || v_run_id || '_' || p.id
            FROM pages p
            JOIN adaptations a ON p.adaptation_id = a.id
            WHERE a.version_id = p_version_id AND a.age_band = 'asli';
        END IF;
    END IF;

    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
