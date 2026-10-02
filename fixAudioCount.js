const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/admin/AdminEditKonten.tsx', 'utf8');

const regexAudioCalc = /const \{ data: adaptations \} = await supabase\s*\.from\('adaptations'\)\s*\.select\('id, pages\(id, page_audio\(id\)\)'\)\s*\.eq\('version_id', versionId\);\s*let aTotal = 0, aComp = 0;\s*adaptations\?\.forEach\(\(ad: any\) => \{\s*ad\.pages\?\.forEach\(\(p: any\) => \{\s*aTotal\+\+;\s*if \(p\.page_audio\?\.length > 0\) aComp\+\+;\s*\}\);\s*\}\);/;

const newAudioCalc = `const { data: adaptations } = await supabase
        .from('adaptations')
        .select('id, age_band, language, pages(id, page_audio(id))')
        .eq('version_id', versionId);

      let aTotal = 0, aComp = 0;
      if (adaptations && adaptations.length > 0) {
        // Only count audio for the 'asli' Indonesian version
        let asliAdapt = adaptations.find((a: any) => a.age_band === 'asli' && a.language === 'id');
        if (!asliAdapt) {
          asliAdapt = adaptations.find((a: any) => a.language === 'id') || adaptations[0];
        }
        
        if (asliAdapt) {
          asliAdapt.pages?.forEach((p: any) => {
            aTotal++;
            if (p.page_audio?.length > 0) aComp++;
          });
        }
      }`;

code = code.replace(regexAudioCalc, newAudioCalc);
fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/admin/AdminEditKonten.tsx', code);
