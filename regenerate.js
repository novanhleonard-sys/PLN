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
  const stories = await get('/stories?select=id,title,story_versions(id,status,asset_status,scenes(id),adaptations(id,pages(id)))');
  const readyVersions = stories.flatMap(s => s.story_versions).filter(v => ['ready', 'generating', 'published'].includes(v.asset_status) || v.status === 'published');
  
  console.log('Found versions to regenerate:', readyVersions.length);
  
  for (const v of readyVersions) {
    console.log('Resetting version:', v.id);
    await patch('/story_versions?id=eq.' + v.id, { asset_status: 'none' });
    
    const sceneIds = v.scenes.map(sc => sc.id);
    if (sceneIds.length > 0) {
      await patch('/scenes?id=in.(' + sceneIds.join(',') + ')', { image_path: null, image_status: 'none' });
      for (const sid of sceneIds) {
        await post('/jobs', {
          kind: 'scene-image',
          ref_type: 'scene',
          ref_id: sid,
          idempotency_key: 'regen_img_' + sid + '_' + Date.now()
        });
      }
    }
    
    for (const ad of v.adaptations) {
      const pageIds = ad.pages.map(p => p.id);
      if (pageIds.length > 0) {
        await del('/page_audio?page_id=in.(' + pageIds.join(',') + ')');
        for (const pid of pageIds) {
          await post('/jobs', {
            kind: 'audio',
            ref_type: 'page',
            ref_id: pid,
            idempotency_key: 'regen_aud_' + pid + '_' + Date.now()
          });
        }
      }
    }
  }
  
  console.log('Regeneration jobs queued!');
}

main().catch(console.error);
