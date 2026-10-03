const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStories() {
    const titles = ["Legenda Amat Rhang Manyang", "Asal Mula Gunung Seulawah"];
    for (const title of titles) {
        console.log(`\n=== STORY: ${title} ===`);
        const { data: story } = await supabase.from('stories').select('*').eq('title', title).single();
        if (!story) {
            console.log("NOT FOUND!");
            continue;
        }
        console.log(`Status: ${story.status}, Hero: ${story.hero_image_path}, Pin: ${story.pin_image_path}`);

        const { data: versions } = await supabase.from('story_versions').select('*').eq('story_id', story.id);
        for (const v of versions) {
            console.log(`\n  Version: ${v.label} (status: ${v.status})`);
            
            // Check Scenes (Images)
            const { data: scenes, error: sErr } = await supabase.from('scenes').select('idx, image_path, image_status, canonical_ref_path').eq('version_id', v.id).order('idx');
            if (sErr) console.error(sErr);
            const scenesArr = scenes || [];
            console.log(`  Scenes (${scenesArr.length}):`);
            for (const s of scenesArr) {
                console.log(`    - Scene ${s.idx}: image_status=${s.image_status} | path=${s.image_path} | ref=${s.canonical_ref_path}`);
            }

            // Check Adaptations (Audio)
            const { data: adapts } = await supabase.from('adaptations').select('id, language').eq('version_id', v.id);
            for (const a of adapts || []) {
                console.log(`  Adaptation (${a.language}):`);
                const { data: pages } = await supabase.from('pages').select('idx, text, page_audio(id, audio_path)').eq('adaptation_id', a.id).order('idx');
                for (const p of pages || []) {
                    const audio = p.page_audio && p.page_audio.length > 0 ? p.page_audio[0] : null;
                    console.log(`    - Page ${p.idx}: Audio=${audio ? audio.audio_path : 'MISSING'}`);
                }
            }
        }
    }
}
checkStories();
