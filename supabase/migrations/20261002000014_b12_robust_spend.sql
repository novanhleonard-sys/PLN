CREATE OR REPLACE FUNCTION get_story_total_spend_idr(p_story_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_usd FLOAT := 0;
BEGIN
    SELECT COALESCE(SUM(a.cost_usd), 0) INTO total_usd
    FROM ai_usage a
    LEFT JOIN jobs j ON a.ref = j.id::text
    WHERE
       -- 1. Jika terhubung via jobs (standard baru / sebagian standard lama)
       (
           j.id IS NOT NULL AND (
               (j.ref_type = 'version' AND j.ref_id IN (SELECT id FROM story_versions WHERE story_id = p_story_id))
               OR (j.ref_type = 'scene' AND j.ref_id IN (SELECT sc.id FROM scenes sc JOIN story_versions v ON sc.version_id = v.id WHERE v.story_id = p_story_id))
               OR (j.ref_type = 'page' AND j.ref_id IN (SELECT p.id FROM pages p JOIN adaptations ad ON p.adaptation_id = ad.id JOIN story_versions v ON ad.version_id = v.id WHERE v.story_id = p_story_id))
               OR (j.ref_type = 'adaptation' AND j.ref_id IN (SELECT ad.id FROM adaptations ad JOIN story_versions v ON ad.version_id = v.id WHERE v.story_id = p_story_id))
               OR (j.ref_type = 'canonical_reference' AND j.ref_id IN (SELECT c.id FROM canonical_references c JOIN story_visual_bibles b ON c.bible_id = b.id JOIN story_versions v ON b.version_id = v.id WHERE v.story_id = p_story_id))
               OR (j.ref_type = 'submission' AND j.ref_id IN (SELECT id FROM submissions WHERE target_story_id = p_story_id))
           )
       )
       OR
       -- 2. Jika tercatat langsung menggunakan entity_id (karena inkonsistensi lama yang selamat dari wipe queue)
       (
           j.id IS NULL AND (
               (a.stage IN ('segment') AND a.ref IN (SELECT id::text FROM story_versions WHERE story_id = p_story_id))
               OR (a.stage IN ('adapt', 'adapt-check') AND a.ref IN (SELECT ad.id::text FROM adaptations ad JOIN story_versions v ON ad.version_id = v.id WHERE v.story_id = p_story_id))
               OR (a.stage IN ('triage', 'verify') AND a.ref IN (SELECT id::text FROM submissions WHERE target_story_id = p_story_id))
           )
       );

    -- Multiply by 15500 for IDR approx
    RETURN (total_usd * 15500)::NUMERIC;
END;
$$ LANGUAGE plpgsql;
