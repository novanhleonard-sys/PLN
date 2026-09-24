import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  console.log('Checking for published stories...');

  // Check stories
  const { data: stories, error: storiesErr } = await supabase
    .from('stories')
    .select('id, title, status')
    .eq('status', 'published');

  if (storiesErr) {
    console.error('Error fetching stories:', storiesErr);
  } else {
    console.log(`Found ${stories?.length || 0} stories with status 'published'.`);
  }

  // Check story_versions
  const { data: versions, error: versionsErr } = await supabase
    .from('story_versions')
    .select('id, status')
    .eq('status', 'published');

  if (versionsErr) {
    console.error('Error fetching story_versions:', versionsErr);
  } else {
    console.log(`Found ${versions?.length || 0} story_versions with status 'published'.`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
