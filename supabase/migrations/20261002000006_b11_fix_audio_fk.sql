ALTER TABLE page_audio ALTER COLUMN persona_id DROP NOT NULL;
ALTER TABLE page_audio DROP CONSTRAINT IF EXISTS page_audio_persona_id_fkey;
ALTER TABLE page_audio ADD CONSTRAINT page_audio_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES voice_personas(id) ON DELETE SET NULL;
