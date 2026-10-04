-- Add explicit tracking columns
ALTER TABLE ai_usage
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS process_run_id UUID REFERENCES ai_process_runs(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION set_ai_usage_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- If ref is a valid UUID, try to link it to jobs and process_runs
  BEGIN
    IF NEW.ref IS NOT NULL THEN
      NEW.job_id := NEW.ref::UUID;
      SELECT process_run_id INTO NEW.process_run_id FROM jobs WHERE id = NEW.job_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if not a UUID
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_ai_usage_tracking ON ai_usage;
CREATE TRIGGER trg_set_ai_usage_tracking
BEFORE INSERT ON ai_usage
FOR EACH ROW
EXECUTE FUNCTION set_ai_usage_tracking();
