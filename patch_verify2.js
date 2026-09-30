const fs = require("fs");
let verify = fs.readFileSync("apps/worker/src/stages/verify/index.ts", "utf-8");

verify = verify.replace(
  /let minConfDecimal = 80; \/\/ percent[\s\S]*?const minConfDecimal = minConfDecimal \/ 100;/m,
  `let rawConf = 80;
  if (appSettings && appSettings.value) {
    autoPublishEnabled = !!appSettings.value.autoPublish;
    rawConf = appSettings.value.confidenceThreshold || 80;
  }
  const minConfDecimal = rawConf / 100;`
);

fs.writeFileSync("apps/worker/src/stages/verify/index.ts", verify, "utf-8");
