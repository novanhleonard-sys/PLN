const fs = require("fs");
let sql = fs.readFileSync("supabase/migrations/20261005000000_b13_process_rpcs.sql", "utf-8");

sql = sql.replace(
  /-- Update story_versions status to processing\s+UPDATE story_versions SET status = 'processing' WHERE id = p_version_id;/g,
  `-- Update story_versions status to processing ONLY IF it's generating text
    IF p_scope = 'all' OR p_scope = 'text_only' THEN
        UPDATE story_versions SET status = 'processing' WHERE id = p_version_id;
    END IF;

    -- Update asset_status to generating if it involves assets
    IF p_scope != 'text_only' THEN
        UPDATE story_versions SET asset_status = 'generating' WHERE id = p_version_id;
    END IF;`
);

fs.writeFileSync("supabase/migrations/20261005000000_b13_process_rpcs.sql", sql, "utf-8");
