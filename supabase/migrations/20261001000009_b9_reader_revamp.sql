CREATE TABLE ambient_sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  audio_url text NOT NULL,
  volume real DEFAULT 1.0,
  is_looping boolean DEFAULT true,
  source text,
  license text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ambient_sound_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sound_id uuid REFERENCES ambient_sounds(id) ON DELETE CASCADE,
  story_type text,
  scene_tags text[],
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS for ambient sounds
ALTER TABLE ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambient_sound_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ambient_sounds" ON ambient_sounds FOR SELECT USING (true);
CREATE POLICY "Admins can manage ambient_sounds" ON ambient_sounds FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can read ambient_sound_rules" ON ambient_sound_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage ambient_sound_rules" ON ambient_sound_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- reading_preferences
ALTER TABLE profiles ADD COLUMN reading_preferences jsonb DEFAULT '{}'::jsonb;
