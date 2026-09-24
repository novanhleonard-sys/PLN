-- B4 RLS Policies

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_runs ENABLE ROW LEVEL SECURITY;

-- Submissions
-- Users can see their own submissions
CREATE POLICY "Users can see own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can see and update all submissions
CREATE POLICY "Admins can manage all submissions" ON submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs
-- Nobody can insert jobs except service_role (which bypasses RLS)
-- Admins can see jobs
CREATE POLICY "Admins can view jobs" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verification Runs
-- Admins can see verification runs
CREATE POLICY "Admins can manage verification runs" ON verification_runs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- App Settings
-- Anyone can read settings
CREATE POLICY "Anyone can read app_settings" ON app_settings
  FOR SELECT USING (true);

-- Only admins can update app_settings
CREATE POLICY "Admins can update app_settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
