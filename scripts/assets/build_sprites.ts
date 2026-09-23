import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'content', 'assets');
const jsonPath = path.join(assetsDir, 'ornaments.json');
const pngPath = path.join(assetsDir, 'ornaments.png');

const json = {
  "perahu_1": { "width": 100, "height": 100, "x": 0, "y": 0, "pixelRatio": 1 },
  "pohon_1": { "width": 100, "height": 100, "x": 100, "y": 0, "pixelRatio": 1 },
  "candi_1": { "width": 100, "height": 100, "x": 200, "y": 0, "pixelRatio": 1 },
  "fallback_pin": { "width": 24, "height": 24, "x": 300, "y": 0, "pixelRatio": 1 }
};

fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));

// Create a 1x1 transparent PNG for now to satisfy the loader. 
// In a real build, we'd use a sprite generator to combine the SVGs.
const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(pngPath, transparentPng);

console.log('Created ornaments.json and ornaments.png');
