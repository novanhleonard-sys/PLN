import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
import http from 'http';

import { BudgetGuard } from './core/budget';
import { ProviderRegistry } from './providers/registry';
import { GeminiProvider } from './providers/gemini';

import { JobRunner } from './core/runner';
import { checkAndRunTierJob } from './jobs/tier/calculate';

// Import stages
import { triageStage } from './stages/triage';
import { verifyStage } from './stages/verify';
import { segmentStage } from './stages/segment';
import { processSceneImageStage } from './stages/scene-image';
import { processStoryVisualBibleStage } from './stages/story-visual-bible';
import { processCanonicalMasterStage } from './stages/canonical-master';
import { audioStage } from './stages/audio';
import { adaptStage } from './stages/adapt';
import { adaptCheckStage } from './stages/adapt-check';
import { translateStage } from './stages/translate';
import { syncAudioStage } from './stages/sync-audio';

// Try to load local env if present
dotenv.config({ path: '../../.env.local' });
dotenv.config();

const WORKER_VERSION = process.env.RENDER_GIT_COMMIT || process.env.npm_package_version || "1.0.0-dev";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Worker needs service role

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const budgetGuard = new BudgetGuard(supabase);
const registry = new ProviderRegistry(supabase, budgetGuard);

registry.register(new GeminiProvider());


const runner = new JobRunner(supabase);

// Register stages
runner.register('triage', async (ctx, job) => await triageStage(ctx, job, registry));
runner.register('verify', async (ctx, job) => await verifyStage(ctx, job, registry));
runner.register('segment', async (ctx, job) => await segmentStage(ctx, job, registry));
runner.register('scene-image', async (ctx, job) => await processSceneImageStage(ctx, job, registry));
runner.register('story-visual-bible', async (ctx, job) => await processStoryVisualBibleStage(ctx, job, registry));
runner.register('canonical-master', async (ctx, job) => await processCanonicalMasterStage(ctx, job, registry));
runner.register('audio', async (ctx, job) => await audioStage(ctx, job, registry));
runner.register('adapt', async (ctx, job) => await adaptStage(ctx, job, registry));
runner.register('adapt_check', async (ctx, job) => await adaptCheckStage(ctx, job, registry));
runner.register('translate', async (ctx, job) => await translateStage(ctx, job, registry));
runner.register('sync_audio', async (ctx, job) => await syncAudioStage(ctx, job));

let isPolling = true;
let lastPollAt = new Date().toISOString();

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  isPolling = false;
  runner.shutdown();
  server.close();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  isPolling = false;
  runner.shutdown();
  server.close();
});

// START SIMPLE HTTP SERVER FOR RENDER WEB SERVICE FREE TIER
const port = process.env.PORT || 8080;
const startTime = Date.now();
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      version: WORKER_VERSION,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      last_poll_at: lastPollAt
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Peta LN Worker v${WORKER_VERSION} started.`);
  console.log(`HTTP Health server listening on port ${port} (Required for Render Web Services)`);
});

async function main() {
  console.log('Worker started. Polling for jobs indefinitely...');
  while (isPolling) {
    try {
      lastPollAt = new Date().toISOString();
      await runner.runOnce(1);
      await checkAndRunTierJob(supabase);
    } catch (e) {
      console.error("Error during runOnce:", e);
    }
    await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
  }
}

main().catch(console.error);
