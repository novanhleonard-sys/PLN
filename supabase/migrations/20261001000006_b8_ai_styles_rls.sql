-- style_configs: Public can read, Admin can all
CREATE POLICY "Public read style_configs" ON style_configs FOR SELECT USING (true);
CREATE POLICY "Admin all style_configs" ON style_configs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- voice_personas: Public can read, Admin can all
CREATE POLICY "Public read voice_personas" ON voice_personas FOR SELECT USING (true);
CREATE POLICY "Admin all voice_personas" ON voice_personas FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- age_band_rules: Public can read, Admin can all
CREATE POLICY "Public read age_band_rules" ON age_band_rules FOR SELECT USING (true);
CREATE POLICY "Admin all age_band_rules" ON age_band_rules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- fallback_backgrounds: Public can read, Admin can all
CREATE POLICY "Public read fallback_backgrounds" ON fallback_backgrounds FOR SELECT USING (true);
CREATE POLICY "Admin all fallback_backgrounds" ON fallback_backgrounds FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
