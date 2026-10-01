const WebSocket = require('ws');
global.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jnmucqbtdzgafuuaowyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXVjcWJ0ZHpnYWZ1dWFvd3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE1ODg2MCwiZXhwIjoyMTA1NzM0ODYwfQ.K9lvH20b8cRz8cbg3bAVQ6sSjczNS_-K1dvk7AeKmBw');

async function run() {
  await supabase.from('jobs').update({ status: 'failed', error: 'CANCELLED_BY_ADMIN' }).in('status', ['queued', 'running']);
  await supabase.from('ai_process_runs').update({ status: 'failed' }).eq('status', 'running');
  console.log('Cancelled all processes');
}
run();
