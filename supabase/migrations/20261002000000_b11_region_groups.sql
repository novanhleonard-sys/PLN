-- 1. Create region_groups table
CREATE TABLE region_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE region_groups ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone
CREATE POLICY "Region groups are readable by everyone" ON region_groups FOR SELECT USING (true);
-- Allow all access for admins
CREATE POLICY "Admins can insert region groups" ON region_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update region groups" ON region_groups FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete region groups" ON region_groups FOR DELETE USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Populate table with existing enums
INSERT INTO region_groups (slug, name) VALUES
('sumatera', 'Sumatera'),
('jawa', 'Jawa'),
('bali_nusra', 'Bali & Nusa Tenggara'),
('kalimantan', 'Kalimantan'),
('sulawesi', 'Sulawesi'),
('maluku', 'Maluku'),
('papua', 'Papua');

-- 2. Add new columns
ALTER TABLE regions ADD COLUMN region_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL;
ALTER TABLE voice_personas ADD COLUMN region_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL;
ALTER TABLE ambient_sounds ADD COLUMN region_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL;
ALTER TABLE style_configs ADD COLUMN region_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL;
ALTER TABLE corpus_docs ADD COLUMN region_group_id UUID REFERENCES region_groups(id) ON DELETE SET NULL;

-- 3. Migrate data
UPDATE regions SET region_group_id = rg.id FROM region_groups rg WHERE regions.region_group::text = rg.slug;
UPDATE voice_personas SET region_group_id = rg.id FROM region_groups rg WHERE voice_personas.region_group::text = rg.slug;
UPDATE ambient_sounds SET region_group_id = rg.id FROM region_groups rg WHERE ambient_sounds.region_group::text = rg.slug;
UPDATE style_configs SET region_group_id = rg.id FROM region_groups rg WHERE style_configs.region_group::text = rg.slug;
UPDATE corpus_docs SET region_group_id = rg.id FROM region_groups rg WHERE corpus_docs.region_group::text = rg.slug;

-- 4. Drop old columns
ALTER TABLE regions DROP COLUMN region_group;
ALTER TABLE voice_personas DROP COLUMN region_group;
ALTER TABLE ambient_sounds DROP COLUMN region_group;
ALTER TABLE style_configs DROP COLUMN region_group;
ALTER TABLE corpus_docs DROP COLUMN region_group;

-- 5. Drop enum type
DROP TYPE region_group;
