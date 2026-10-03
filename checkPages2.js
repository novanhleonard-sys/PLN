const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPages2() {
    const { data: s } = await supabase.from('pages').select('id, story_id, sequence_number, content');
    console.log("Pages count:", s ? s.length : 0);
    if (s && s.length > 0) {
        console.table(s.slice(0, 5));
    }
}
checkPages2();
