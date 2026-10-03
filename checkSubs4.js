const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSubs4() {
    const { data: s } = await supabase.from('submissions').select('id, title, status, body').ilike('title', '%Bawang%');
    s.forEach(x => {
        console.log(`ID: ${x.id} | Title: ${x.title} | Status: ${x.status} | BodyLength: ${x.body.length}`);
        console.log(`Preview: ${x.body.substring(0, 50)}...\n`);
    });
}
checkSubs4();
