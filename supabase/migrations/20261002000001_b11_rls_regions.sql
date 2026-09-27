-- B11: Allow public read access to regions and region_groups
CREATE POLICY "regions: public read"
  ON regions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "region_groups: public read"
  ON region_groups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "regions: admin write"
  ON regions FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "region_groups: admin write"
  ON region_groups FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
