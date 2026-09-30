const fs = require("fs");
let sql = fs.readFileSync("supabase/migrations/20261008000001_b13_fix_process_rpc_status.sql", "utf-8");
sql = sql.replace(/INSERT INTO ai_process_runs \(version_id,/g, "INSERT INTO ai_process_runs (story_version_id,");
fs.writeFileSync("supabase/migrations/20261008000001_b13_fix_process_rpc_status.sql", sql, "utf-8");
