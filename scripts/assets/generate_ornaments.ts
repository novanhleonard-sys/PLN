import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

// Load env
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set. Please set it in .env.local or environment.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const prompts = [
  "Create a simple SVG for a beautiful cartoon ship sailing on the sea. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a cartoon pine tree for a map. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a cartoon temple icon for a map. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a cartoon-style small island with a palm tree. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a stylized mountain peak for a map. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a sea monster or whale tail in the ocean for a map. Top-down isometric map view. Output only the SVG code, no markdown.",
  "Create a simple SVG for a traditional Indonesian boat (pinisi) for a map. Top-down isometric map view. Output only the SVG code, no markdown."
];

const targetDir = path.join(process.cwd(), 'content', 'assets', 'candidates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function generateOrnaments() {
  console.log("Starting ornament generation using Gemini API (SVG generation)...");
  let count = 0;

  for (let i = 0; i < prompts.length; i++) {
    for (let j = 0; j < 5; j++) {
      const fileName = `ornament_${i}_${j}.svg`;
      const filePath = path.join(targetDir, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`Skipping ${fileName} as it already exists`);
        count++;
        continue;
      }
      
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompts[i] + " Make it slightly different each time. Provide ONLY valid <svg> tag as the response, without ```svg wrapping.",
        });
        
        let text = response.text || "";
        text = text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
        
        if (text.startsWith('<svg')) {
            fs.writeFileSync(filePath, text);
            console.log(`Saved ${fileName}`);
            count++;
        } else {
            console.error(`Failed to parse SVG for ${fileName}`);
        }
      } catch (e) {
         console.error(`Failed to generate ${fileName}:`, e);
      }
    }
  }

  console.log(`Generated ${count} candidates.`);
}

generateOrnaments().catch(console.error);
