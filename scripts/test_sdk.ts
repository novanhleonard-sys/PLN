import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  const geminiSchema = {
    type: Type.OBJECT,
    properties: {
      isValid: { type: Type.BOOLEAN },
      originalStory: { type: Type.STRING },
      location: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
          name: { type: Type.STRING }
        }
      },
      confidence: { type: Type.NUMBER },
      reason: { type: Type.STRING }
    },
    required: ["isValid", "originalStory", "location", "confidence", "reason"]
  };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Verify story: Legenda Rawa Pening. Asal mula rawa pening dari cabutan lidi Baru Klinthing.',
      config: {
        systemInstruction: "Kembalikan JSON.",
        responseMimeType: 'application/json',
        responseSchema: geminiSchema as any,
      }
    });
    console.log(response.text);
  } catch (err) {
    console.log(err.message);
  }
}
run();
