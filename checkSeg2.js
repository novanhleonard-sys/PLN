const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSegments2() {
    const { data: s } = await supabase.from('story_segments').select('id, story_id, seq, content');
    console.log(s ? s.length : 0);
    if(s && s.length > 0) console.log(s[0]);
}
checkSegments2();
