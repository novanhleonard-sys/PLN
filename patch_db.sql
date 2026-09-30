UPDATE story_versions
SET asset_status = 'failed'
WHERE id IN (
  SELECT story_version_id FROM ai_process_runs WHERE status = 'failed'
);
