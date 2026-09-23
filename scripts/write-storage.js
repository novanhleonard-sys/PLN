const fs = require('fs');
const sql = `
INSERT INTO storage.buckets (id, name, public) VALUES 
('story-media', 'story-media', true),
('map-assets', 'map-assets', true),
('corpus', 'corpus', false);

-- Public read for story-media
CREATE POLICY "Public read story-media" ON storage.objects FOR SELECT USING (bucket_id = 'story-media');
-- Admin all story-media
CREATE POLICY "Admin all story-media" ON storage.objects FOR ALL USING (bucket_id = 'story-media' AND is_admin());

-- Public read for map-assets
CREATE POLICY "Public read map-assets" ON storage.objects FOR SELECT USING (bucket_id = 'map-assets');
CREATE POLICY "Admin all map-assets" ON storage.objects FOR ALL USING (bucket_id = 'map-assets' AND is_admin());

-- Admin all for corpus
CREATE POLICY "Admin all corpus" ON storage.objects FOR ALL USING (bucket_id = 'corpus' AND is_admin());
`;
fs.writeFileSync('D:\\project\\PETA LN\\supabase\\migrations\\20260923122428_storage.sql', sql);
