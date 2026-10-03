const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: 'D:/project/PETA LN/.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: story } = await supabase.from('stories').select('id').eq('title', 'Legenda Amat Rhang Manyang').single();
  const { data: version } = await supabase.from('story_versions').select('id').eq('story_id', story.id).single();
  const { data: scenes } = await supabase.from('scenes').select('id, image_path, image_status').eq('version_id', version.id);
  
  console.dir(scenes);
}
run();
