const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAmatRun() {
    const { data: run, error } = await supabase.from('ai_process_runs').select('status').eq('id', '1ac8767e-d478-4b7c-8fc0-f85423225d69').single();
    console.log("Amat run 1ac8767e status:", run.status);
}
checkAmatRun();
