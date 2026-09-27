-- 1. Fix update_story_stats trigger to use upsert
CREATE OR REPLACE FUNCTION update_story_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'read_history' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO story_stats (story_id, reads_count) VALUES (NEW.story_id, 1)
            ON CONFLICT (story_id) DO UPDATE SET reads_count = story_stats.reads_count + 1;
        END IF;
    ELSIF TG_TABLE_NAME = 'saved_stories' THEN
        IF TG_OP = 'INSERT' THEN
            INSERT INTO story_stats (story_id, saves_count) VALUES (NEW.story_id, 1)
            ON CONFLICT (story_id) DO UPDATE SET saves_count = story_stats.saves_count + 1;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE story_stats SET saves_count = saves_count - 1 WHERE story_id = OLD.story_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Initialize missing story_stats
INSERT INTO story_stats (story_id, reads_count, saves_count, score)
SELECT id, 0, 0, 0 FROM stories
ON CONFLICT (story_id) DO NOTHING;

-- 2. Create get_story_total_spend_idr function
CREATE OR REPLACE FUNCTION get_story_total_spend_idr(p_story_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_usd FLOAT := 0;
BEGIN
    -- Version jobs
    SELECT COALESCE(SUM(cost_usd), 0) INTO total_usd FROM jobs WHERE ref_type = 'version' AND ref_id IN (SELECT id FROM story_versions WHERE story_id = p_story_id);
    
    -- Scene jobs
    total_usd := total_usd + COALESCE((SELECT SUM(cost_usd) FROM jobs WHERE ref_type = 'scene' AND ref_id IN (
        SELECT sc.id FROM scenes sc JOIN story_versions v ON sc.version_id = v.id WHERE v.story_id = p_story_id
    )), 0);

    -- Page jobs (Audio)
    total_usd := total_usd + COALESCE((SELECT SUM(cost_usd) FROM jobs WHERE ref_type = 'page' AND ref_id IN (
        SELECT p.id FROM pages p JOIN adaptations a ON p.adaptation_id = a.id JOIN story_versions v ON a.version_id = v.id WHERE v.story_id = p_story_id
    )), 0);

    -- Adaptation jobs
    total_usd := total_usd + COALESCE((SELECT SUM(cost_usd) FROM jobs WHERE ref_type = 'adaptation' AND ref_id IN (
        SELECT a.id FROM adaptations a JOIN story_versions v ON a.version_id = v.id WHERE v.story_id = p_story_id
    )), 0);

    -- Canonical reference jobs
    total_usd := total_usd + COALESCE((SELECT SUM(cost_usd) FROM jobs WHERE ref_type = 'canonical_reference' AND ref_id IN (
        SELECT c.id FROM canonical_references c JOIN story_visual_bibles b ON c.bible_id = b.id JOIN story_versions v ON b.version_id = v.id WHERE v.story_id = p_story_id
    )), 0);

    -- Multiply by 15500 for IDR approx
    RETURN (total_usd * 15500)::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- 3. Create admin_stories_view
CREATE OR REPLACE VIEW admin_stories_view AS
SELECT s.*, 
       COALESCE(st.reads_count, 0) as reads_count,
       get_story_total_spend_idr(s.id) as total_spend_idr
FROM stories s
LEFT JOIN story_stats st ON s.id = st.story_id;
