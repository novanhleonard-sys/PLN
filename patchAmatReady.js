const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patchAmatReady() {
    const { data: story } = await supabase.from('stories').select('id').eq('title', 'Legenda Amat Rhang Manyang').single();
    const { data: v } = await supabase.from('story_versions').select('id').eq('story_id', story.id).single();

    await supabase.from('scenes').update({ image_status: 'ready' }).eq('version_id', v.id);
    await supabase.from('story_versions').update({ asset_status: 'ready' }).eq('id', v.id);
    console.log("Patched to ready.");
}
patchAmatReady();
