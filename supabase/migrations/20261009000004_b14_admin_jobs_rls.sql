-- B14: Add Admin RLS Policy for jobs
CREATE POLICY "Admin full jobs" ON jobs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
