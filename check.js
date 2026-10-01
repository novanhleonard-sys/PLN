const WebSocket = require('ws');
global.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://jnmucqbtdzgafuuaowyo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubXVjcWJ0ZHpnYWZ1dWFvd3lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE1ODg2MCwiZXhwIjoyMTA1NzM0ODYwfQ.K9lvH20b8cRz8cbg3bAVQ6sSjczNS_-K1dvk7AeKmBw');

async function run() {
  let { data: versions } = await supabase.from('story_versions').select('id, asset_status, story_id, story:stories(title)').eq('status', 'published');
  console.log('All Published Stories:', versions.map(v => v.story.title + ' -> ' + v.asset_status));
}
run();
