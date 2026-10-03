const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRawaVB() {
    const { data: vb } = await supabase.from('story_visual_bibles').select('id, version_id').eq('id', '6e82535b-e40b-4315-93ce-d169744e465a').single();
    console.log(vb);
    const { data: cRefs } = await supabase.from('canonical_references').select('id, name, image_path, status, is_canonical').eq('bible_id', vb.id);
    console.dir(cRefs);
}
checkRawaVB();
