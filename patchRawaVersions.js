const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function patchRawa() {
    await supabase.from('story_versions').update({ status: 'archived' }).eq('id', '188e4c42-0411-4b29-af97-1e152fded41f');
    console.log("Archived old version.");
}
patchRawa();
