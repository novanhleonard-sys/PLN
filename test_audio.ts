globalThis.WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });
const { GeminiProvider } = require('./apps/worker/src/providers/gemini.ts');
// since it's typescript, we should run it with tsx
async function run() {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: "Halo dunia!",
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
        }
      }
    });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find((p) => p.inlineData && p.inlineData.mimeType?.startsWith('audio/'));
  console.log("Mime type:", audioPart?.inlineData?.mimeType);
  const fs = require('fs');
  fs.writeFileSync('test.wav', Buffer.from(audioPart.inlineData.data, 'base64'));
}
run();
