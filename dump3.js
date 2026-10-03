const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dumpAll3() {
    const { data: s } = await supabase.from('stories').select('id, title').eq('title', 'Dongeng Bawang dan Kesuna');
    console.log("Stories:", s);
    for (const story of (s || [])) {
        const { data: v } = await supabase.from('story_versions').select('id, story_id').eq('story_id', story.id);
        for (const ver of (v || [])) {
            console.log("Version:", ver.id);
            const { data: a } = await supabase.from('adaptations').select('id, target_age_band, version_id').eq('version_id', ver.id);
            for (const ad of (a || [])) {
                console.log(" Adaptation:", ad.id, ad.target_age_band);
                const { data: p } = await supabase.from('pages').select('id, content').eq('adaptation_id', ad.id);
                console.log("  Pages count:", p ? p.length : 0);
                if(p && p.length) console.log("  First page:", p[0].content);
            }
        }
    }
}
dumpAll3();
