-- Drop the old single ID columns
ALTER TABLE style_configs DROP COLUMN IF EXISTS region_group_id;
ALTER TABLE voice_personas DROP COLUMN IF EXISTS region_group_id;
ALTER TABLE ambient_sounds DROP COLUMN IF EXISTS region_group_id;

-- Add the new Array columns
ALTER TABLE style_configs ADD COLUMN region_group_ids UUID[] DEFAULT '{}'::UUID[];
ALTER TABLE voice_personas ADD COLUMN region_group_ids UUID[] DEFAULT '{}'::UUID[];
ALTER TABLE ambient_sounds ADD COLUMN region_group_ids UUID[] DEFAULT '{}'::UUID[];
