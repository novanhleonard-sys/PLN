const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkJobs() {
    const { data: subs } = await supabase.from('submissions').select('id, title, status');
    console.log("Submissions:");
    console.table(subs);
    
    for (const sub of subs) {
       const { data: jobs } = await supabase.from('jobs').select('id, kind, status, error').eq('ref_id', sub.id);
       console.log(`\nJobs for ${sub.title}:`);
       console.table(jobs);
    }
}
checkJobs();
