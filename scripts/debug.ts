import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
  const { data: pages } = await supabase.from('pages').select('id, adaptation_id, idx, text').limit(5);
  console.log("Any Pages:", pages);
}
run();
