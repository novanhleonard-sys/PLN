const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/worker/src/core/runner.ts', 'utf8');

code = code.replace(
  "await this.handleRateLimit(job, msg);",
  "await this.handleRateLimit(job, msg);\n        } else if (msg.includes('WAITING_FOR') || msg.includes('not ready yet')) {\n          await this.handleWait(job, msg);"
);

fs.writeFileSync('D:/project/PETA LN/apps/worker/src/core/runner.ts', code, 'utf8');
