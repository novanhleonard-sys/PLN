-- Allow service_role to bypass RLS on profiles (for manage_admin edge function)
CREATE POLICY "Service role can update profiles" ON profiles
FOR UPDATE USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins can update profiles" ON profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "Service role can insert profiles" ON profiles
FOR INSERT WITH CHECK (auth.role() = 'service_role');
