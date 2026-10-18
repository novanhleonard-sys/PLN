CREATE OR REPLACE FUNCTION update_ai_process_run_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total INT;
  v_completed INT;
  v_failed INT;
  v_version_id UUID;
  v_scope process_run_scope;
BEGIN
  IF NEW.process_run_id IS NOT NULL THEN
    -- Ambil info process run
    SELECT story_version_id, scope INTO v_version_id, v_scope 
    FROM ai_process_runs 
    WHERE id = NEW.process_run_id;

    -- Hitung status jobs
    SELECT COUNT(*), 
           COUNT(*) FILTER (WHERE status = 'succeeded'),
           COUNT(*) FILTER (WHERE status = 'failed')
    INTO v_total, v_completed, v_failed
    FROM jobs 
    WHERE process_run_id = NEW.process_run_id;

    IF v_total > 0 THEN
      IF v_completed = v_total THEN
        UPDATE ai_process_runs SET status = 'completed' WHERE id = NEW.process_run_id;
        IF v_version_id IS NOT NULL THEN
          IF v_scope = 'text_only' THEN
            UPDATE story_versions SET status = 'published', asset_status = 'none' WHERE id = v_version_id;
          ELSE
            UPDATE story_versions SET status = 'published', asset_status = 'ready' WHERE id = v_version_id;
          END IF;
          IF v_scope = 'audio_only' OR v_scope = 'all' THEN
            UPDATE adaptations SET audio_status = 'ready' WHERE version_id = v_version_id AND age_band = 'asli';
          END IF;
        END IF;
      ELSIF v_failed > 0 THEN
        UPDATE ai_process_runs SET status = 'failed' WHERE id = NEW.process_run_id;
        IF v_version_id IS NOT NULL THEN
          IF v_scope != 'text_only' THEN
            UPDATE story_versions SET asset_status = 'failed' WHERE id = v_version_id;
          END IF;
          IF v_scope = 'audio_only' OR v_scope = 'all' THEN
            UPDATE adaptations SET audio_status = 'failed' WHERE version_id = v_version_id AND age_band = 'asli';
          END IF;
          IF v_scope = 'image_only' OR v_scope = 'all' THEN
            -- Safeguard: hanya tandai failed jika belum memiliki image_path
            UPDATE scenes SET image_status = 'failed' WHERE version_id = v_version_id AND image_path IS NULL;
          END IF;
        END IF;
      ELSE
        UPDATE ai_process_runs SET status = 'running' WHERE id = NEW.process_run_id;
        IF v_version_id IS NOT NULL THEN
          IF v_scope != 'text_only' THEN
            UPDATE story_versions SET asset_status = 'generating' WHERE id = v_version_id;
          END IF;
          IF v_scope = 'audio_only' OR v_scope = 'all' THEN
            UPDATE adaptations SET audio_status = 'generating' WHERE version_id = v_version_id AND age_band = 'asli';
          END IF;
          IF v_scope = 'image_only' OR v_scope = 'all' THEN
            -- Safeguard: jangan overwrite jika gambar sudah ada
            UPDATE scenes SET image_status = 'generating' WHERE version_id = v_version_id AND image_path IS NULL;
          END IF;
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
