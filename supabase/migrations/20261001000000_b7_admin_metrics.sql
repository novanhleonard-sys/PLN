CREATE TABLE app_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE read_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
    adaptation_id UUID NOT NULL REFERENCES adaptations(id) ON DELETE CASCADE,
    mode TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated to insert and update their own sessions
CREATE POLICY "Allow public insert to app_sessions" ON app_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to app_sessions" ON app_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow admin read app_sessions" ON app_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public insert to read_sessions" ON read_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to read_sessions" ON read_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow admin read read_sessions" ON read_sessions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'admin')
);
