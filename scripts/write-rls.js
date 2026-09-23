const fs = require('fs');
const sql = `
-- Admin role check function
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update all profiles" ON profiles FOR ALL USING (is_admin());

-- Trigger to prevent role update by non-admin
CREATE OR REPLACE FUNCTION prevent_role_update() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can change roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_role_update_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION prevent_role_update();

-- Regions
CREATE POLICY "Public read regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Admin all regions" ON regions FOR ALL USING (is_admin());

-- Stories
CREATE POLICY "Public read published stories" ON stories FOR SELECT USING (status = 'published');
CREATE POLICY "Admin all stories" ON stories FOR ALL USING (is_admin());

-- Story versions
CREATE POLICY "Public read published versions" ON story_versions FOR SELECT USING (status = 'published');
CREATE POLICY "Admin all versions" ON story_versions FOR ALL USING (is_admin());

-- Adaptations
CREATE POLICY "Public read ready adaptations" ON adaptations FOR SELECT USING (status = 'ready');
CREATE POLICY "Admin all adaptations" ON adaptations FOR ALL USING (is_admin());

-- Scenes
CREATE POLICY "Public read scenes" ON scenes FOR SELECT USING (true);
CREATE POLICY "Admin all scenes" ON scenes FOR ALL USING (is_admin());

-- Pages
CREATE POLICY "Read pages" ON pages FOR SELECT USING (
    EXISTS (SELECT 1 FROM adaptations WHERE adaptations.id = pages.adaptation_id AND adaptations.status = 'ready')
    AND (
        auth.uid() IS NOT NULL
        OR idx <= free_page_limit(adaptation_id)
    )
);
CREATE POLICY "Admin all pages" ON pages FOR ALL USING (is_admin());

-- Fallback backgrounds, story_stats
CREATE POLICY "Public read fallback_backgrounds" ON fallback_backgrounds FOR SELECT USING (true);
CREATE POLICY "Admin all fallback_backgrounds" ON fallback_backgrounds FOR ALL USING (is_admin());

CREATE POLICY "Public read story_stats" ON story_stats FOR SELECT USING (true);
CREATE POLICY "Admin all story_stats" ON story_stats FOR ALL USING (is_admin());

-- page_audio
CREATE POLICY "Read page_audio" ON page_audio FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pages
        JOIN adaptations ON pages.adaptation_id = adaptations.id
        WHERE pages.id = page_audio.page_id 
        AND adaptations.status = 'ready'
        AND (auth.uid() IS NOT NULL OR pages.idx <= free_page_limit(adaptations.id))
    )
);
CREATE POLICY "Admin all page_audio" ON page_audio FOR ALL USING (is_admin());

-- saved_stories, read_history
CREATE POLICY "CRUD own saved_stories" ON saved_stories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "CRUD own read_history" ON read_history FOR ALL USING (auth.uid() = user_id);

-- submissions
CREATE POLICY "Read own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin all submissions" ON submissions FOR ALL USING (is_admin());

-- reports
CREATE POLICY "Insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin all reports" ON reports FOR ALL USING (is_admin());

-- Admin only
CREATE POLICY "Admin read verification_runs" ON verification_runs FOR SELECT USING (is_admin());
CREATE POLICY "Admin read corpus_docs" ON corpus_docs FOR SELECT USING (is_admin());
CREATE POLICY "Admin read corpus_chunks" ON corpus_chunks FOR SELECT USING (is_admin());
CREATE POLICY "Admin read jobs" ON jobs FOR SELECT USING (is_admin());
CREATE POLICY "Admin read ai_usage" ON ai_usage FOR SELECT USING (is_admin());
CREATE POLICY "Admin all app_settings" ON app_settings FOR ALL USING (is_admin());

-- Public settings
CREATE POLICY "Public read app_settings" ON app_settings FOR SELECT USING (true);

-- Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE adaptations, story_versions, page_audio;
`;
fs.writeFileSync('D:\\project\\PETA LN\\supabase\\migrations\\20260923122423_rls.sql', sql);