CREATE OR REPLACE FUNCTION update_job_cost_from_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume ref is a valid UUID for a job if it's not null and looks like a UUID
  -- To be safe, we just try to update.
  BEGIN
    UPDATE jobs 
    SET cost_usd = COALESCE(cost_usd, 0) + COALESCE(NEW.cost_usd, 0)
    WHERE id = NEW.ref::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- If NEW.ref is not a valid UUID (e.g. for non-job usage), just ignore
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_job_cost ON ai_usage;
CREATE TRIGGER trg_update_job_cost
AFTER INSERT ON ai_usage
FOR EACH ROW
EXECUTE FUNCTION update_job_cost_from_usage();
