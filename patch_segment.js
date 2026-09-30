const fs = require("fs");
let segment = fs.readFileSync("apps/worker/src/stages/segment/index.ts", "utf-8");

segment = segment.replace(
  /ref_id: pageData\.id,\s*status: "queued"/g,
  "ref_id: pageData.id,\n      process_run_id: job.process_run_id,\n      status: \"queued\""
);

fs.writeFileSync("apps/worker/src/stages/segment/index.ts", segment, "utf-8");
