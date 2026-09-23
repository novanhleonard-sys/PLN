const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';
const outPath = path.join(__dirname, 'content', 'regions', 'jawa-temp.geojson');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const geojson = JSON.parse(data);
      
      // Filter for Java provinces (using standard Indonesian names)
      const javaProvinces = [
        'BANTEN', 'DKI JAKARTA', 'JAWA BARAT', 
        'JAWA TENGAH', 'DI YOGYAKARTA', 'JAWA TIMUR'
      ];
      
      const filteredFeatures = geojson.features.filter(f => {
        // Find property name, might be Propinsi, NAME_1, etc.
        const name = (f.properties.Propinsi || f.properties.NAME_1 || f.properties.name || '').toUpperCase();
        return javaProvinces.includes(name);
      });
      
      const javaGeojson = {
        type: 'FeatureCollection',
        features: filteredFeatures
      };
      
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(javaGeojson));
      console.log('Successfully saved Java ADM1 geojson with', filteredFeatures.length, 'provinces.');
    } catch(err) {
      console.error('Error parsing or filtering:', err);
    }
  });
}).on('error', err => {
  console.error('Error downloading:', err);
});
