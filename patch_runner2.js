const fs = require("fs");
let runner = fs.readFileSync("apps/worker/src/core/runner.ts", "utf-8");

runner = runner.replace(
  /    \} catch \(err: any\) \{[\s\S]*?    \}\n    \}\n  \}/m,
  (match) => match.replace(/    \}\n    \}\n  \}/, "    }\n  }")
);

fs.writeFileSync("apps/worker/src/core/runner.ts", runner, "utf-8");
