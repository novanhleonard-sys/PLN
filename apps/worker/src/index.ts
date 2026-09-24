import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;

import { BudgetGuard } from './core/budget';
import { ProviderRegistry } from './providers/registry';
import { GeminiProvider } from './providers/gemini';
import { ZaiProvider } from './providers/zai';
import { JobRunner } from './core/runner';

// Import stages
import { triageStage } from './stages/triage';
import { verifyStage } from './stages/verify';
import { segmentStage } from './stages/segment';
import { characterStage } from './stages/character';
import { processSceneImageStage } from './stages/scene-image';
import { audioStage } from './stages/audio';

dotenv.config({ path: '../../.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
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
runner.register('scene-image', async (ctx, job) => await processSceneImageStage(ctx, job));
runner.register('audio', async (ctx, job) => await audioStage(ctx, job));

const isPolling = true;

async function main() {
  console.log('Worker started. Polling for jobs...');
  let iterations = 0;
  while (isPolling && iterations < 30) {
    await runner.runOnce(1);
    await new Promise(r => setTimeout(r, 2000));
    iterations++;
  }
}

main().catch(console.error);
