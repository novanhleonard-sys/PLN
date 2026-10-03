const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRuns() {
    const { data: runs } = await supabase.from('verification_runs').select('*').eq('submission_id', '617d4855-18b4-4c8c-98ee-5b28355d5761');
    console.table(runs);
}
checkRuns();
