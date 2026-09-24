import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function run() {
  const { data: v } = await supabase.from('story_versions').select('id,story:stories(title)').limit(3);
  if (v && v.length >= 2) {
    // Set the second story to generating
    await supabase.from('story_versions').update({ asset_status: 'generating' }).eq('id', v[1].id);
    
    // For multi-version, create a second version for the first story
    const { data: adapt } = await supabase.from('adaptations').insert({
      version_id: v[0].id,
      age_band: '3-4',
      prompt_version: 'v1',
      status: 'ready'
    }).select().single();
    
    const { data: scene } = await supabase.from('scenes').insert({
      version_id: v[0].id,
      idx: 2,
      description: 'A test scene desc for 3-4',
      image_prompt: 'A test scene prompt for 3-4',
      image_path: 'mock_image_34.jpg',
      image_status: 'ready'
    }).select().single();
    
    if (adapt && scene) {
        await supabase.from('pages').insert([
            { adaptation_id: adapt.id, idx: 1, text: 'Halaman 3-4 satu', scene_id: scene.id }
        ]);
    }
  }
}
run();
