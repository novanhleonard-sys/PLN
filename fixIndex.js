const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/worker/src/index.ts', 'utf8');

code = code.replace(
  /import \{ translateStage \} from '.\/stages\/translate';/,
  "import { translateStage } from './stages/translate';\nimport { syncAudioStage } from './stages/sync-audio';"
);

code = code.replace(
  /runner\.register\('translate', async \(ctx, job\) => await translateStage\(ctx, job, registry\)\);/,
  "runner.register('translate', async (ctx, job) => await translateStage(ctx, job, registry));\nrunner.register('sync_audio', async (ctx, job) => await syncAudioStage(ctx, job));"
);

fs.writeFileSync('D:/project/PETA LN/apps/worker/src/index.ts', code);
