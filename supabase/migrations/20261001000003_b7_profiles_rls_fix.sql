-- Drop the recursive admin policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Just allow public to read profiles (since it only has id, name, role)
CREATE POLICY "Public can read profiles" ON profiles
FOR SELECT USING (true);
