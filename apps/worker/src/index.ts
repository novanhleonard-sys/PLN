import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
import http from 'http';

import { BudgetGuard } from './core/budget';
import { ProviderRegistry } from './providers/registry';
import { GeminiProvider } from './providers/gemini';
import { ZaiProvider } from './providers/zai';
import { JobRunner } from './core/runner';
import { checkAndRunTierJob } from './jobs/tier/calculate';

// Import stages
import { triageStage } from './stages/triage';
import { verifyStage } from './stages/verify';
import { segmentStage } from './stages/segment';
import { characterStage } from './stages/character';
import { processSceneImageStage } from './stages/scene-image';
import { audioStage } from './stages/audio';
import { adaptStage } from './stages/adapt';
import { adaptCheckStage } from './stages/adapt-check';

// Try to load local env if present
dotenv.config({ path: '../../.env.local' });
dotenv.config();

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
registry.register(new ZaiProvider());

const runner = new JobRunner(supabase);

// Register stages
runner.register('triage', async (ctx, job) => await triageStage(ctx, job, registry));
runner.register('verify', async (ctx, job) => await verifyStage(ctx, job, registry));
runner.register('segment', async (ctx, job) => await segmentStage(ctx, job, registry));
runner.register('character', async (ctx, job) => await characterStage(ctx, job, registry));
runner.register('scene-image', async (ctx, job) => await processSceneImageStage(ctx, job, registry));
runner.register('audio', async (ctx, job) => await audioStage(ctx, job, registry));
runner.register('adapt', async (ctx, job) => await adaptStage(ctx, job, registry));
runner.register('adapt_check', async (ctx, job) => await adaptCheckStage(ctx, job, registry));

const isPolling = true;

// START SIMPLE HTTP SERVER FOR RENDER WEB SERVICE FREE TIER
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Peta LN Worker is healthy and running!\n');
});

server.listen(port, () => {
  console.log(`HTTP Health server listening on port ${port} (Required for Render Web Services)`);
});

async function main() {
  console.log('Worker started. Polling for jobs indefinitely...');
  while (isPolling) {
    try {
      await runner.runOnce(1);
      await checkAndRunTierJob(supabase);
    } catch (e) {
      console.error("Error during runOnce:", e);
    }
    await new Promise(r => setTimeout(r, 5000)); // Poll every 5 seconds
  }
}

main().catch(console.error);
