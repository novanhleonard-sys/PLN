CREATE OR REPLACE FUNCTION get_job_story_title(job_record jobs)
RETURNS TEXT AS $$
DECLARE
    title TEXT;
BEGIN
    IF job_record.ref_type = 'version' THEN
        SELECT s.title INTO title FROM story_versions v JOIN stories s ON v.story_id = s.id WHERE v.id = job_record.ref_id;
    ELSIF job_record.ref_type = 'scene' THEN
        SELECT s.title INTO title FROM scenes sc JOIN story_versions v ON sc.version_id = v.id JOIN stories s ON v.story_id = s.id WHERE sc.id = job_record.ref_id;
    ELSIF job_record.ref_type = 'page' THEN
        SELECT s.title INTO title FROM pages p JOIN adaptations a ON p.adaptation_id = a.id JOIN story_versions v ON a.version_id = v.id JOIN stories s ON v.story_id = s.id WHERE p.id = job_record.ref_id;
    ELSIF job_record.ref_type = 'adaptation' THEN
        SELECT s.title INTO title FROM adaptations a JOIN story_versions v ON a.version_id = v.id JOIN stories s ON v.story_id = s.id WHERE a.id = job_record.ref_id;
    ELSIF job_record.ref_type = 'canonical_reference' THEN
        SELECT s.title INTO title FROM canonical_references cr JOIN story_visual_bibles b ON cr.bible_id = b.id JOIN story_versions v ON b.version_id = v.id JOIN stories s ON v.story_id = s.id WHERE cr.id = job_record.ref_id;
    END IF;
    RETURN title;
END;
$$ LANGUAGE plpgsql;
