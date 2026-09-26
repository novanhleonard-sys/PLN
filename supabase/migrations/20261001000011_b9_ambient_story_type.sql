ALTER TABLE ambient_sounds ADD COLUMN IF NOT EXISTS story_type text;
ALTER TABLE ambient_sounds ADD COLUMN IF NOT EXISTS region_group text;
ALTER TABLE ambient_sound_rules ADD COLUMN IF NOT EXISTS story_type text;
