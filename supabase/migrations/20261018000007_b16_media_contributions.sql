-- Migration: 20261018000007_b16_media_contributions.sql
-- Description: Artist media contributions table, scenes and page_audio artist columns, storage policies, and approval RPC

-- 1. Add artist credit columns to scenes and page_audio
ALTER TABLE scenes
  ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS artist_credits TEXT;

ALTER TABLE page_audio
  ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS artist_credits TEXT;

-- 2. Create media_contributions table
CREATE TABLE IF NOT EXISTS media_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'audio')),
  credits TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index to allow clean upsert (one active/latest submission per user/version/media_type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_contributions_user_version_type 
  ON media_contributions (user_id, story_version_id, media_type);

-- 3. RLS for media_contributions
ALTER TABLE media_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_contrib_select" ON media_contributions;
CREATE POLICY "media_contrib_select" ON media_contributions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "media_contrib_insert" ON media_contributions;
CREATE POLICY "media_contrib_insert" ON media_contributions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "media_contrib_update" ON media_contributions;
CREATE POLICY "media_contrib_update" ON media_contributions
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "media_contrib_delete" ON media_contributions;
CREATE POLICY "media_contrib_delete" ON media_contributions
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Storage policies for artist-contributions
DROP POLICY IF EXISTS "Allow authenticated users to upload artist-contributions" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload artist-contributions" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'artist-contributions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow authenticated users to update artist-contributions" ON storage.objects;
CREATE POLICY "Allow authenticated users to update artist-contributions" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'artist-contributions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow authenticated users to delete artist-contributions" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete artist-contributions" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'story-media' AND 
  (storage.foldername(name))[1] = 'artist-contributions' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 5. RPC to approve media contribution batch
CREATE OR REPLACE FUNCTION approve_media_contribution(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contrib RECORD;
  v_item JSONB;
  v_target_id UUID;
  v_file_path TEXT;
  v_count INT := 0;
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya admin yang dapat menyetujui kontribusi media.';
  END IF;

  SELECT * INTO v_contrib FROM media_contributions WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kontribusi media tidak ditemukan.';
  END IF;

  -- Loop through items in array
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_contrib.items)
  LOOP
    v_target_id := (v_item->>'target_id')::UUID;
    v_file_path := v_item->>'file_path';

    IF v_contrib.media_type = 'image' THEN
      UPDATE scenes
      SET 
        image_path = v_file_path,
        image_status = 'ready',
        artist_id = v_contrib.user_id,
        artist_credits = v_contrib.credits
      WHERE id = v_target_id;
      v_count := v_count + 1;
    ELSIF v_contrib.media_type = 'audio' THEN
      UPDATE page_audio
      SET 
        path = v_file_path,
        status = 'ready',
        artist_id = v_contrib.user_id,
        artist_credits = v_contrib.credits
      WHERE page_id = v_target_id;
      
      IF NOT FOUND THEN
        INSERT INTO page_audio (page_id, path, status, artist_id, artist_credits)
        VALUES (v_target_id, v_file_path, 'ready', v_contrib.user_id, v_contrib.credits);
      END IF;
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- Update media_contributions status
  UPDATE media_contributions
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_id;

  RETURN jsonb_build_object(
    'success', true,
    'media_type', v_contrib.media_type,
    'applied_items', v_count
  );
END;
$$;
