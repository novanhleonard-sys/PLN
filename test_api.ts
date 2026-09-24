import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/worker/.env.local' });
dotenv.config({ path: '.env.local' }); // Fallback to root if needed

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Halo, test 123.'
    });
    console.log('SUCCESS:', resp.text);
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
test();
