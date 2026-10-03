const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patch() {
    const { data: scenes } = await supabase.from('scenes').select('id, image_path, image_status').not('image_path', 'is', null);
    console.log(`Found ${scenes.length} scenes with images.`);
    for (const s of scenes) {
        if (s.image_status !== 'ready') {
            console.log(`Fixing scene ${s.id}...`);
            await supabase.from('scenes').update({ image_status: 'ready' }).eq('id', s.id);
        }
    }
}
patch();
