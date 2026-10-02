-- Add language column to adaptations table
ALTER TABLE adaptations ADD COLUMN language TEXT NOT NULL DEFAULT 'id';

-- Drop the old unique constraint
ALTER TABLE adaptations DROP CONSTRAINT adaptations_version_id_age_band_prompt_version_key;

-- Add the new unique constraint including language
ALTER TABLE adaptations ADD CONSTRAINT adaptations_version_id_age_band_lang_prompt_version_key UNIQUE (version_id, age_band, language, prompt_version);
