const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testClaim() {
    const { data: jobs, error } = await supabase.rpc('claim_job', {
        p_kinds: ['segment', 'story-visual-bible', 'canonical-master', 'canonical-ref', 'scene-image', 'audio', 'finalize'],
        p_limit: 1
    });
    console.dir(jobs);
    if (error) console.error(error);
}
testClaim();
