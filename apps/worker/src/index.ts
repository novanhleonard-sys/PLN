import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { BudgetGuard } from './core/budget';
import { ProviderRegistry } from './providers/registry';
import { GeminiProvider } from './providers/gemini';
import { ZaiProvider } from './providers/zai';
import { JobRunner } from './core/runner';

// Import stages
import { processTriageStage } from './stages/triage';
import { processVerifyStage } from './stages/verify';
import { processSegmentStage } from './stages/segment';
import { processCharacterStage } from './stages/character';
import { processSceneImageStage } from './stages/scene-image';
import { processFinalizeStage } from './stages/finalize';
import { processAudioStage } from './stages/audio';

dotenv.config({ path: '.env.local' });

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
runner.register('triage', processTriageStage);
runner.register('verify', processVerifyStage);
runner.register('segment', processSegmentStage);
runner.register('character', processCharacterStage);
runner.register('scene-image', processSceneImageStage);
runner.register('finalize', processFinalizeStage);
runner.register('audio', processAudioStage);

let isPolling = true;

async function main() {
  console.log('Worker started. Polling for jobs...');
  while (isPolling) {
    await runner.runOnce(5);
    await new Promise(r => setTimeout(r, 2000));
  }
}

process.on('SIGINT', () => {
  console.log('Shutting down...');
  isPolling = false;
  runner.shutdown();
});

main().catch(console.error);
