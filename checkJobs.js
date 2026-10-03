const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkJobs() {
    const { data: jobs } = await supabase.from('jobs').select('*').in('ref_id', ['3d8dbb37-afdb-44ee-b57b-1dbffe9bbcb6', 'bf617fac-355f-43fb-89d1-a51cc81cc896']);
    console.table(jobs);
}
checkJobs();
