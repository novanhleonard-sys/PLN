-- B13: RPCs for starting AI Process Runs

CREATE OR REPLACE FUNCTION approve_submission_to_version(p_submission_id UUID)
RETURNS UUID AS $$
DECLARE
    v_sub RECORD;
    v_story_id UUID;
    v_version_id UUID;
    v_slug TEXT;
BEGIN
    SELECT * INTO v_sub FROM submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission not found';
    END IF;

    -- Update status
    UPDATE submissions SET status = 'approved' WHERE id = p_submission_id;

    v_slug := regexp_replace(lower(v_sub.title), '[^a-z0-9]+', '-', 'g');
    
    -- Upsert story
    INSERT INTO stories (title, slug, type, synopsis, lat, lng, status)
    VALUES (v_sub.title, v_slug, v_sub.type, v_sub.synopsis, COALESCE(v_sub.lat, 0), COALESCE(v_sub.lng, 0), 'published')
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
    RETURNING id INTO v_story_id;

    -- Insert version
    INSERT INTO story_versions (story_id, label, sources, contributor_id, body, status)
    VALUES (v_story_id, v_sub.version_label, v_sub.sources, v_sub.user_id, v_sub.body, 'processing')
    RETURNING id INTO v_version_id;

    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION start_ai_process_run(
    p_version_id UUID,
    p_scope process_run_scope,
    p_config_snapshot JSONB
)
RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
BEGIN
    -- Insert run
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
        INSERT INTO jobs (kind, ref_type, ref_id, process_run_id, idempotency_key)
        VALUES ('sync_audio', 'version', p_version_id, v_run_id, 'run_' || v_run_id || '_sync_audio');
    END IF;

    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
