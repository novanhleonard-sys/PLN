import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function clean() {
  const titlesToKeep = ['Kancil dan Buaya', 'Legenda Rawa Pening', 'Si Pitung'];
  console.log('Cleaning up dummy stories...');
  const { data: stories } = await supabase.from('stories').select('id, title');
  
  if (stories) {
    for (const story of stories) {
      if (!titlesToKeep.includes(story.title)) {
        console.log(`Deleting ${story.title} (${story.id})`);
        await supabase.from('stories').delete().eq('id', story.id);
      }
    }
  }
  
  console.log('Done!');
}

clean();
