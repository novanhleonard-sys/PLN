const fs = require('fs');
const env = require('dotenv').parse(fs.readFileSync('.env.local'));
async function fetchDb() {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/stories?select=id,title,status,story_versions(id,status,asset_status,adaptations(id,status,age_band,audio_status,pages(id,text,page_audio(id,status,path))),scenes(id,image_status,image_path))`;
  const res = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.log("Error:", data);
    return;
  }
  
  let totalStories = data.length;
  let totalVersions = 0;
  let totalAdaptations = 0;
  let totalPages = 0;
  let totalScenes = 0;
  let readyImages = 0;
  let totalAudio = 0;
  let readyAudio = 0;

  data.forEach(s => {
    if (s.story_versions) {
      totalVersions += s.story_versions.length;
      s.story_versions.forEach(v => {
        if (v.scenes) {
          totalScenes += v.scenes.length;
          readyImages += v.scenes.filter(sc => sc.image_status === 'ready' || sc.image_path).length;
        }
        if (v.adaptations) {
          totalAdaptations += v.adaptations.length;
          v.adaptations.forEach(a => {
            if (a.pages) {
              totalPages += a.pages.length;
              a.pages.forEach(p => {
                if (p.page_audio) {
                  totalAudio += p.page_audio.length;
                  readyAudio += p.page_audio.filter(au => au.status === 'ready' || au.path).length;
                }
              });
            }
          });
        }
      });
    }
  });
  
  console.log("=== Laporan Hasil Pekerjaan AI ===");
  console.log(`Total Cerita: ${totalStories}`);
  console.log(`Total Versi Cerita: ${totalVersions}`);
  console.log(`Total Adaptasi: ${totalAdaptations}`);
  console.log(`Total Halaman (Pages): ${totalPages}`);
  console.log(`Total Gambar (Scenes): ${readyImages} ready / ${totalScenes} requested`);
  console.log(`Total Suara (Audio): ${readyAudio} ready / ${totalAudio} requested`);
  
  console.log("\n--- Detail per Cerita ---");
  data.forEach(s => {
    console.log(`\nCerita: ${s.title}`);
    s.story_versions?.forEach((v, idx) => {
      console.log(`  - Versi ${idx+1} [Status: ${v.status}, Asset: ${v.asset_status}]`);
      v.adaptations?.forEach(a => {
        let audios = 0;
        let readyAud = 0;
        a.pages?.forEach(p => {
          if (p.page_audio) {
            audios += p.page_audio.length;
            readyAud += p.page_audio.filter(au => au.status === 'ready' || au.path).length;
          }
        });
        console.log(`    * Adaptasi [Usia: ${a.age_band}] -> Halaman: ${a.pages?.length || 0} | Suara Ready: ${readyAud}/${audios}`);
      });
      const scReady = v.scenes?.filter(sc => sc.image_status === 'ready' || sc.image_path).length || 0;
      const scTotal = v.scenes?.length || 0;
      console.log(`    * Gambar (Scenes) Ready: ${scReady}/${scTotal}`);
    });
  });
}
fetchDb();
