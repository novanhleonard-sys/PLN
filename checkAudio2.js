const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAudio() {
    const { data: jobs } = await supabase.from('jobs').select('status').eq('kind', 'audio');
    const counts = {};
    for (const j of jobs || []) {
        counts[j.status] = (counts[j.status] || 0) + 1;
    }
    console.log("Audio jobs status:", counts);

    // If there are any failed jobs that might retry, let's defer them too
    const { data: updated } = await supabase.from('jobs').update({status: 'deferred'}).eq('kind', 'audio').eq('status', 'failed').select('id');
    console.log("Deferred failed audio jobs:", updated ? updated.length : 0);
}
checkAudio();
