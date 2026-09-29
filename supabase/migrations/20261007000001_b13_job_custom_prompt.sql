-- B13: Add custom_prompt to jobs for admin revision override
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS custom_prompt TEXT;
