const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkJobs() {
    const { data: story } = await supabase.from('stories').select('id').eq('title', 'Asal Mula Gunung Seulawah').single();
    const { data: v } = await supabase.from('story_versions').select('id').eq('story_id', story.id).single();
    const { data: scenes } = await supabase.from('scenes').select('id, idx').eq('version_id', v.id);
    
    for (const s of scenes) {
        const { data: jobs } = await supabase.from('jobs').select('status, error').eq('ref_id', s.id).order('created_at', { ascending: false });
        console.log(`Scene ${s.idx} jobs:`, jobs);
    }
}
checkJobs();
