const fs = require("fs");
let runner = fs.readFileSync("apps/worker/src/core/runner.ts", "utf-8");

// 1. Add 500 and 503 to the rate limit / retry logic
runner = runner.replace(
  /\} else if \(msg\.includes\('429'\) \|\| msg\.includes\('Quota exceeded'\) \|\| msg\.includes\('RESOURCE_EXHAUSTED'\)\) \{/g,
  `} else if (msg.includes('429') || msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('500') || msg.includes('503')) {`
);

// 2. Change attempts from 2 to 4
runner = runner.replace(
  /if \(job\.attempts >= 2\) \{/g,
  `if (job.attempts >= 4) {`
);
runner = runner.replace(
  /has failed 2 times/g,
  `has failed 4 times`
);

fs.writeFileSync("apps/worker/src/core/runner.ts", runner, "utf-8");
