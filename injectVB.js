const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function injectVB() {
    const { data: v } = await supabase.from('story_versions').select('id').eq('story_id', 'b656664a-8be7-47f2-9336-6161c4a0649f').single();
    
    const { data, error } = await supabase.from('jobs').insert({
        kind: 'story-visual-bible',
        ref_type: 'version',
        ref_id: v.id,
        process_run_id: '1ac8767e-d478-4b7c-8fc0-f85423225d69',
        status: 'queued',
        attempts: 0,
        run_after: new Date().toISOString(),
        idempotency_key: 'run_1ac8767e_bible_manual_fix'
    });
    console.log("Inserted VB job.", error);
}
injectVB();
