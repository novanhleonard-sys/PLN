const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkJobs() {
    const { data: jobs, error } = await supabase.from('jobs').select('status, kind').eq('process_run_id', '33992ac2-79a3-48a3-8af9-82dd1f00410f');
    console.log("Run 33992ac2 jobs:");
    console.dir(jobs);
}
checkJobs();
