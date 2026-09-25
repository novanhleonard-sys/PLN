globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function reset() {
  await supabase.from('jobs').update({ status: 'queued', error: null, attempts: 0 }).eq('kind', 'audio');
  console.log('Reset complete');
}
reset();
