const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    console.log("--- STORIES ---");
    const { data: s } = await supabase.from('stories').select('id, title, status, is_published').in('title', ['Tuan Tapa dan Putri Naga', 'Dongeng Bawang dan Kesuna']);
    console.table(s);

    if (s && s.length > 0) {
        console.log("--- SEGMENTS ---");
        for (const story of s) {
            const { data: segs } = await supabase.from('story_segments').select('id, seq, content').eq('story_id', story.id).order('seq');
            console.log(`Story: ${story.title} - Segments: ${segs ? segs.length : 0}`);
            if (segs && segs.length > 0) {
                console.log(`  Seg 1: ${segs[0].content}`);
            }
        }
    }
}
checkData();
