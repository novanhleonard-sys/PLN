const fs = require('fs');
const path = require('path');
const filePath = path.join('D:\\project\\PETA LN\\apps\\web\\src\\features\\admin\\AdminEditKonten.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const searchStr =         const { error: storyErr } = await supabase.from('stories').update({
          title: data.title,
          type: data.type,
          region_id: data.region_id || null
        }).eq('id', id);;

const replaceStr =         const { error: storyErr } = await supabase.from('stories').update({
          title: data.title,
          type: data.type,
          region_id: data.region_id || null,
          lat: data.lat,
          lng: data.lng,
          synopsis: data.synopsis,
          hero_image_path: data.hero_image_path,
          pin_image_path: data.pin_image_path,
          asset_credits: data.asset_credits
        }).eq('id', id);;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(filePath, content);
console.log('Modified AdminEditKonten.tsx');
