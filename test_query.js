globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('pages').select('*, adaptation:adaptations(*, version:story_versions(*, story:stories(*)))').limit(1).single();
  console.log(error || data.adaptation);
}
test();
