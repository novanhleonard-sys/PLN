const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRuns() {
    const { data: runs } = await supabase.from('ai_process_runs').select('id, status, created_at').order('created_at', { ascending: false }).limit(5);
    console.log(runs);
}
checkRuns();
