const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkScene() {
    const { data: scenes } = await supabase.from('scenes').select('idx, description').eq('version_id', 'ffcc3387-504c-4d47-890c-07735273e71d').eq('idx', 5).single();
    console.log(scenes);
}
checkScene();
