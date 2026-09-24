import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

async function seed() {
  await supabase.from('pages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('scenes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('adaptations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { data: versions } = await supabase.from('story_versions').select('id, story_id, body');
  if (!versions) return;

  for (const v of versions) {
    const { data: adapt } = await supabase.from('adaptations').insert({
      version_id: v.id,
      age_band: 'asli',
      prompt_version: 'v1',
      status: 'ready'
    }).select().single();

    if (!adapt) continue;

    const { data: scene, error: sceneErr } = await supabase.from('scenes').insert({
      version_id: v.id,
      idx: 1,
      description: 'A test scene description',
      image_prompt: 'A test scene prompt',
      image_path: 'mock_image.jpg',
      image_status: 'ready'
    }).select().single();

    if (sceneErr) console.error(sceneErr);

    if (!scene) continue;

    await supabase.from('pages').insert([
      { adaptation_id: adapt.id, idx: 1, text: 'Halaman satu dari ' + v.body.substring(0, 50), scene_id: scene.id },
      { adaptation_id: adapt.id, idx: 2, text: 'Halaman dua. ' + v.body.substring(50, 100), scene_id: scene.id },
      { adaptation_id: adapt.id, idx: 3, text: 'Halaman tiga. ' + v.body.substring(100, 150), scene_id: scene.id }
    ]);
    
    // Set status to ready
    await supabase.from('story_versions').update({ asset_status: 'ready' }).eq('id', v.id);
  }
}
seed();
