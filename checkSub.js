const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSub() {
    const { data: sub } = await supabase.from('submissions').select('id, title, status').eq('title', 'Dongeng Bawang dan Kesuna').single();
    if (!sub) return console.log("Not found.");
    
    console.log("Submission:", sub);
    
    const { data: jobs } = await supabase.from('jobs').select('id, kind, status, error, attempts').eq('ref_id', sub.id);
    console.log("Jobs for this submission:", jobs);
}
checkSub();
