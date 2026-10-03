const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRawaJobs2() {
    const { data: jobs } = await supabase.from('jobs').select('status, kind, error, attempts').ilike('process_run_id', 'bb66ae57%');
    console.dir(jobs);
}
checkRawaJobs2();
