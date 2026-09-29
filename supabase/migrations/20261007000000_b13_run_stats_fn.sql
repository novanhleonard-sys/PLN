-- B13: Function to compute run stats from ai_usage (cost) and jobs (attempts)
CREATE OR REPLACE FUNCTION get_run_stats(p_run_id UUID)
RETURNS TABLE(total_cost_usd NUMERIC, total_attempts INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(u.cost_usd), 0) AS total_cost_usd,
    COALESCE(SUM(j.attempts), 0)::INT AS total_attempts
  FROM jobs j
  LEFT JOIN ai_usage u ON u.ref = j.id::TEXT
  WHERE j.process_run_id = p_run_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
