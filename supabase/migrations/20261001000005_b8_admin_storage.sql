INSERT INTO storage.buckets (id, name, public) VALUES 
('admin-assets', 'admin-assets', true);

-- Public read for admin-assets (since these are used for previews in the app)
CREATE POLICY "Public read admin-assets" ON storage.objects FOR SELECT 
USING (bucket_id = 'admin-assets');

-- Admin all for admin-assets
CREATE POLICY "Admin all admin-assets" ON storage.objects FOR ALL 
USING (bucket_id = 'admin-assets' AND (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')));
