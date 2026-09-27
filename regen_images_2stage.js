require('dotenv').config({path: '.env.local'});
const url = process.env.VITE_SUPABASE_URL + '/rest/v1';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { 'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

async function get(path) {
  const r = await fetch(url + path, { headers });
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
async function patch(path, body) {
  const r = await fetch(url + path, { method: 'PATCH', headers, body: JSON.stringify(body) });
  if(!r.ok) throw new Error(await r.text());
}
async function del(path) {
  const r = await fetch(url + path, { method: 'DELETE', headers });
  if(!r.ok) throw new Error(await r.text());
}
async function post(path, body) {
  const r = await fetch(url + path, { method: 'POST', headers, body: JSON.stringify(body) });
  if(!r.ok) throw new Error(await r.text());
}

async function main() {
  const stories = await get('/stories?select=id,title,story_versions(id,status,asset_status,scenes(id))');
  const readyVersions = stories.flatMap(s => s.story_versions).filter(v => ['ready', 'generating', 'published'].includes(v.asset_status) || v.status === 'published');
  
  console.log('Found versions to regenerate:', readyVersions.length);
  
  for (const v of readyVersions) {
    console.log('Processing version:', v.id);
    
    // 1. Delete existing bible (cascades)
    try { await del('/story_visual_bibles?version_id=eq.' + v.id); } catch(e) {}
    
    // 2. Wipe scenes
    const sceneIds = v.scenes.map(sc => sc.id);
    if (sceneIds.length > 0) {
      try { await del('/jobs?kind=eq.scene-image&ref_id=in.(' + sceneIds.join(',') + ')'); } catch(e) {}
      await patch('/scenes?id=in.(' + sceneIds.join(',') + ')', { image_path: null, image_status: 'none' });
    }
    
    // 3. Queue story-visual-bible job
    await post('/jobs', {
      kind: 'story-visual-bible',
      ref_type: 'version',
      ref_id: v.id,
      idempotency_key: 'bible_regen_' + v.id + '_' + Date.now()
    });
  }
  
  console.log('All image regeneration tasks queued via the new Two-Stage Pipeline!');
}

main().catch(console.error);
