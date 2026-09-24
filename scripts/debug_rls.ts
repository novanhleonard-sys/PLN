import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;

dotenv.config({ path: 'apps/web/.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function run() {
  const { data: pages, error } = await supabase.from('pages').select('*, scene:scenes(*)').eq('adaptation_id', '3362eb32-0db5-4ecd-9d27-e3938cce0464');
  console.log("Pages (asli):", pages);
  console.log("Error:", error);
  
  const { data: pages2 } = await supabase.from('pages').select('*, scene:scenes(*)').eq('adaptation_id', 'c3552789-e9ad-4938-be8b-9d9de1cd14b4');
  console.log("Pages (3-4):", pages2);
}
run();
