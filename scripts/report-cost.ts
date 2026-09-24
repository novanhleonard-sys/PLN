import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await supabase.from('ai_usage').select('stage, cost_usd');
  if (error) {
    console.error("Error fetching ai_usage", error);
    return;
  }
  let total = 0;
  const byStage: Record<string, number> = {};
  for (const row of data) {
    total += row.cost_usd;
    byStage[row.stage] = (byStage[row.stage] || 0) + row.cost_usd;
  }
  
  console.log("=== Laporan Biaya AI ===");
  console.log(`Total Biaya: $${total.toFixed(4)}`);
  for (const [stage, cost] of Object.entries(byStage)) {
    console.log(` - ${stage}: $${cost.toFixed(4)}`);
  }
}

run();
