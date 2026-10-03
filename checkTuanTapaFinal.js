const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTuanTapaFinal() {
    const { data: s } = await supabase.from('stories').select('*').eq('title', 'Tuan Tapa dan Putri Naga').single();
    if (s) {
        console.log("Story:", s.id);
        const { data: v } = await supabase.from('story_versions').select('*').eq('story_id', s.id);
        console.log("Versions:", v.length);
        if(v.length > 0) {
            const { data: a } = await supabase.from('adaptations').select('*').eq('version_id', v[0].id);
            console.log("Adaptations:", a.length);
            if (a.length > 0) {
                const { data: p } = await supabase.from('pages').select('*').eq('adaptation_id', a[0].id);
                console.log("Pages:", p.length);
            }
        }
    }
}
checkTuanTapaFinal();
