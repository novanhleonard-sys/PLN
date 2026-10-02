const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/ReaderHeader.tsx', 'utf8');

// Destructure `disabled` prop
code = code.replace(
  /title, mode, onModeChange, themeClasses, versionId, storyId, onAdaptationReady, onAdaptationPending[\s\S]*?\)\s*=>\s*\{/,
  'title, mode, onModeChange, themeClasses, versionId, storyId, onAdaptationReady, onAdaptationPending, disabled\n}) => {'
);

fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/ReaderHeader.tsx', code);
