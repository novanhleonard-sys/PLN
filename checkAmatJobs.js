const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAmatJobs() {
    const { data: jobs, error } = await supabase.from('jobs').select('status, error, kind').eq('process_run_id', '1ac8767e-d478-4b7c-8fc0-f85423225d69');
    console.log("Amat jobs:");
    console.dir(jobs);
}
checkAmatJobs();
