CREATE TABLE story_visual_bibles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    overall_direction JSONB NOT NULL,
    rendering_style JSONB NOT NULL,
    color_palette JSONB NOT NULL,
    characters JSONB NOT NULL,
    locations JSONB NOT NULL,
    props JSONB NOT NULL,
    scene_plans JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE canonical_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bible_id UUID NOT NULL REFERENCES story_visual_bibles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT,
    status asset_status NOT NULL DEFAULT 'none',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE story_visual_bibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE canonical_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bibles" ON story_visual_bibles FOR SELECT USING (true);
CREATE POLICY "Admin all bibles" ON story_visual_bibles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public read canonical_references" ON canonical_references FOR SELECT USING (true);
CREATE POLICY "Admin all canonical_references" ON canonical_references FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
