const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: runs } = await supabase.from('ai_process_runs').select('id, story_version_id, scope, status').in('id', ['1ac8767e-d478-4b7c-8fc0-f85423225d69', 'd48807f7-00a5-474c-a8b7-b6a0c3a61c96', '19b5267e-4bef-4c7e-af0d-0a4963cc23ea']);
  console.dir(runs);
}
run();
