const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dump() {
    const storyId = '39cecf2a-6bf9-48de-a350-f6e183840394';
    console.log("Fetching versions...");
    const { data: v } = await supabase.from('story_versions').select('id').eq('story_id', storyId);
    console.log("Versions:", v);
    if(v && v.length) {
        const { data: a } = await supabase.from('adaptations').select('id').eq('version_id', v[0].id);
        console.log("Adaptations:", a);
        if(a && a.length) {
            const { data: p } = await supabase.from('pages').select('id, idx, content, instruction').eq('adaptation_id', a[0].id).order('idx');
            console.log("Pages:");
            console.table(p);
        }
    }
}
dump();
