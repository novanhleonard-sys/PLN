CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL, -- 'image' | 'audio'
    text_prompt TEXT NOT NULL,
    style_id UUID REFERENCES style_configs(id) ON DELETE CASCADE,
    voice_id UUID REFERENCES voice_personas(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued',
    result_url TEXT,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all test_runs" ON test_runs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
