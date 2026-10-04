-- Patch for B14: Fix contributor_id field name in RPC
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
