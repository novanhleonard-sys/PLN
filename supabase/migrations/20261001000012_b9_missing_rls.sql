CREATE POLICY "Users can manage their own saved_stories" ON saved_stories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own read_history" ON read_history FOR ALL USING (auth.uid() = user_id);
