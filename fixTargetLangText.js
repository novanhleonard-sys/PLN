const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', 'utf8');
code = code.replace(/language === 'en'/g, "targetLanguage === 'en'");
fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', code);
