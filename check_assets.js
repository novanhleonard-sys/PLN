const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data: versions, error } = await supabase.from('story_versions').select('id, status, asset_status, pages(id, content, image_url, audio_url)');
  if (error) {
    console.error("Error fetching versions:", error);
    return;
  }
  console.log('Total Versions:', versions.length);
  versions.forEach(v => {
    console.log(`Version ${v.id} (Status: ${v.status}, Asset Status: ${v.asset_status})`);
    if (v.pages && v.pages.length > 0) {
      console.log(`  - ${v.pages.length} pages found.`);
      let hasImage = 0;
      let hasAudio = 0;
      let imgUrls = [];
      let audioUrls = [];
      v.pages.forEach((p, idx) => {
        if (p.image_url) { hasImage++; imgUrls.push(p.image_url.slice(0, 30) + '...'); }
        if (p.audio_url) { hasAudio++; audioUrls.push(p.audio_url.slice(0, 30) + '...'); }
      });
      console.log(`  - Pages with Image: ${hasImage}/${v.pages.length}`);
      if (hasImage > 0) console.log(`    Examples: ${imgUrls[0]}`);
      console.log(`  - Pages with Audio: ${hasAudio}/${v.pages.length}`);
      if (hasAudio > 0) console.log(`    Examples: ${audioUrls[0]}`);
    } else {
      console.log('  - No pages found.');
    }
  });
}
check();
