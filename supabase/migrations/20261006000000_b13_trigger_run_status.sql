CREATE OR REPLACE FUNCTION update_ai_process_run_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total INT;
  v_completed INT;
  v_failed INT;
BEGIN
  IF NEW.process_run_id IS NOT NULL THEN
    SELECT COUNT(*), 
           COUNT(*) FILTER (WHERE status = 'succeeded'),
           COUNT(*) FILTER (WHERE status = 'failed')
    INTO v_total, v_completed, v_failed
    FROM jobs 
    WHERE process_run_id = NEW.process_run_id;

    IF v_total > 0 THEN
      IF v_completed = v_total THEN
        UPDATE ai_process_runs SET status = 'completed' WHERE id = NEW.process_run_id;
      ELSIF v_failed > 0 THEN
        UPDATE ai_process_runs SET status = 'failed' WHERE id = NEW.process_run_id;
      ELSE
        UPDATE ai_process_runs SET status = 'running' WHERE id = NEW.process_run_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ai_process_run_status ON jobs;
CREATE TRIGGER trg_update_ai_process_run_status
AFTER UPDATE OF status OR INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_ai_process_run_status();
