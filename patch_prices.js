const fs = require("fs");
let content = fs.readFileSync("packages/shared/src/ai/prices.ts", "utf-8");

// Replace AI_PRICES object
const newPrices = `export const AI_PRICES = {
  gemini: {
    'gemini-flash-latest': { input_per_1m: 0.075, output_per_1m: 0.30 },
    'gemini-pro-latest': { input_per_1m: 1.25, output_per_1m: 2.50 },
    'gemini-2.0-flash': { input_per_1m: 0.10, output_per_1m: 0.40 },
    'gemini-2.5-flash-preview-tts': { input_per_1m: 0.10, output_per_1m: 0.40 },
    'gemini-3.6-flash': { input_per_1m: 0.075, output_per_1m: 0.30 },
    'gemini-3.8-flash': { input_per_1m: 0.10, output_per_1m: 0.40 },
    'gemini-3.1-flash-image': { per_image: 0.067 }
  },
  zai: {
    'glm-5.3-flash': { input_per_1m: 0.01, output_per_1m: 0.01 }
  }
};`;

content = content.replace(/export const AI_PRICES = \{[\s\S]*?\};\r?\n/, newPrices + "\n");
fs.writeFileSync("packages/shared/src/ai/prices.ts", content, "utf-8");
