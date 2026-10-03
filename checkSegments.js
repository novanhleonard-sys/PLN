const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSegments() {
    const { data: s } = await supabase.from('story_segments').select('id, story_id, seq, content').in('story_id', ['39cecf2a-6bf9-48de-a350-f6e183840394', 'bb32363e-bdf1-4316-827d-28b6bd667cbc']).order('seq');
    console.table(s);
}
checkSegments();
