const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', 'utf8');

const regexUseEffect = /useEffect\(\(\) => \{\s*if \(versionData\?\.adaptations && !selectedAdaptation\) \{[\s\S]*?\}, \[versionData, selectedAdaptation, readHistory\]\);/;
const newUseEffect = `  useEffect(() => {
    if (versionData?.adaptations && !selectedAdaptation) {
      if (readHistory && readHistory.adaptation_id) {
        setSelectedAdaptation(readHistory.adaptation_id);
        setCurrentPage(Math.max(0, (readHistory.last_page || 1) - 1));
      } else {
        const asli = versionData.adaptations.find((a: any) => a.age_band === 'asli' && a.language === 'id') || versionData.adaptations.find((a: any) => a.language === 'id') || versionData.adaptations[0];
        if (asli) setSelectedAdaptation(asli.id);
      }
    }
  }, [versionData, selectedAdaptation, readHistory]);`;

code = code.replace(regexUseEffect, newUseEffect);

const brokenJSXRegex = />\s*<h2 className=\{cn\("text-2xl font-bold font-fredoka mb-8", themeClasses\.textMain\)\}>Pilih Versi Bacaan<\/h2>[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}/;
code = code.replace(brokenJSXRegex, '');

fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', code);
