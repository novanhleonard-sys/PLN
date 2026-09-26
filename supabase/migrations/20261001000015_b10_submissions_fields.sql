-- Add new columns to stories
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS hero_image_path TEXT,
ADD COLUMN IF NOT EXISTS pin_image_path TEXT;

-- Add new columns to submissions
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS synopsis TEXT,
ADD COLUMN IF NOT EXISTS hero_image_path TEXT,
ADD COLUMN IF NOT EXISTS pin_image_path TEXT,
ADD COLUMN IF NOT EXISTS asset_credits TEXT,
ADD COLUMN IF NOT EXISTS force_new_reason TEXT;

-- Storage policies for story-media bucket
CREATE POLICY "Allow authenticated users to upload submissions" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'submissions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow authenticated users to update their submissions" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'submissions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Allow authenticated users to delete their submissions" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'submissions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
