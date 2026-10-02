const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', 'utf8');

const regexUseEffect = /  useEffect\(\(\) => \{\s*if \(\!currentAdapt \|\| \!versionData\) return;\s*\/\/ If the selected adaptation already matches the requested language, do nothing\s*if \(currentAdapt\.language === language\) return;[\s\S]*?\}, \[language, currentAdapt\?\.age_band, versionData, versionId\]\);/;

const newUseEffect = `  const targetLanguage = mode === 'Dongeng' ? 'id' : language;

  useEffect(() => {
    if (!currentAdapt || !versionData) return;
    
    // If the selected adaptation already matches the requested language, do nothing
    if (currentAdapt.language === targetLanguage) return;
    
    // Find if the requested language version exists for this age band
    const existing = versionData.adaptations.find(
      (a: any) => a.age_band === currentAdapt.age_band && a.language === targetLanguage
    );
    
    if (existing) {
      if (existing.status === 'ready') {
         setSelectedAdaptation(existing.id);
      } else {
         setPendingAdaptId(existing.id);
         setPendingBand(existing.age_band);
      }
    } else {
      // Request new translation or adaptation
      setPendingBand(currentAdapt.age_band);
      supabase.functions.invoke('request_adaptation', {
        body: { version_id: versionId, band: currentAdapt.age_band, language: targetLanguage }
      }).then(({ data, error }) => {
        if (error) {
          alert('Gagal meminta terjemahan: ' + error.message);
          setLanguage(currentAdapt.language); // Revert
          setPendingBand(null);
          return;
        }
        if (data?.error) {
          alert(data.error);
          setLanguage(currentAdapt.language); // Revert
          setPendingBand(null);
          return;
        }
        if (data?.status === 'ready') {
          setSelectedAdaptation(data.adaptation_id);
          setPendingBand(null);
        } else {
          setPendingAdaptId(data.adaptation_id);
        }
      });
    }
  }, [targetLanguage, currentAdapt?.age_band, currentAdapt?.language, versionData, versionId, setLanguage]);`;

code = code.replace(regexUseEffect, newUseEffect);

fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/reader/baca/Baca.tsx', code);
