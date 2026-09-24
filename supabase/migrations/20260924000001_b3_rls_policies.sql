-- Fungsi bantuan untuk menghitung free_page_limit
CREATE OR REPLACE FUNCTION free_page_limit(p_adaptation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*) INTO total FROM pages WHERE adaptation_id = p_adaptation_id;
    RETURN GREATEST(1, FLOOR(0.1 * total));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kebijakan Publik (baca)
CREATE POLICY "Publik dapat membaca cerita yang diterbitkan" ON stories
FOR SELECT USING (status = 'published');

CREATE POLICY "Publik dapat membaca versi cerita yang diproses/diterbitkan" ON story_versions
FOR SELECT USING (status IN ('published', 'processing'));

CREATE POLICY "Publik dapat membaca adaptasi yang siap" ON adaptations
FOR SELECT USING (status = 'ready');

CREATE POLICY "Publik dapat membaca scenes" ON scenes
FOR SELECT USING (image_status = 'ready' OR image_status = 'generating');

-- Kebijakan Berbasis Gerbang untuk Halaman
CREATE POLICY "Pengguna login dapat membaca semua halaman" ON pages
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anonim dapat membaca halaman hingga batas gratis" ON pages
FOR SELECT USING (auth.uid() IS NULL AND idx <= free_page_limit(adaptation_id));

CREATE POLICY "Pengguna login dapat membaca semua audio" ON page_audio
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anonim dapat membaca audio hingga batas gratis" ON page_audio
FOR SELECT USING (auth.uid() IS NULL AND page_id IN (
    SELECT id FROM pages WHERE idx <= free_page_limit(adaptation_id)
));
