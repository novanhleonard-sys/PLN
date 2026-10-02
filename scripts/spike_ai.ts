import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Load ENV from apps/worker/.env.local and root .env
import * as dotenv from 'dotenv'; dotenv.config({ path: '.env.local' }); 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.log('--- SPIKE AI START ---');
  
  // 1. Triage (Gemini Flash)
  console.log('\n[1] Triase (Gemini 2.0 Flash)');
  const triageStart = Date.now();
  const triageResp = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: 'Validasi apakah cerita ini tentang legenda atau mitos di Indonesia: "Pada zaman dahulu, ada seorang pangeran bernama Bandung Bondowoso..." Jawab singkat VALID atau SPAM.',
  });
  console.log('Triage Response:', triageResp.text);
  console.log('Triage Latency:', Date.now() - triageStart, 'ms');
  
  // 2. Grounding (Gemini Pro)
  console.log('\n[2] Grounding (Gemini 1.5 Pro)');
  const groundStart = Date.now();
  const groundResp = await ai.models.generateContent({
    model: 'gemini-pro-latest',
    contents: 'Siapa itu Roro Jonggrang dan apa hubungannya dengan Candi Prambanan? Sertakan referensi web.',
    config: {
      tools: [{ googleSearch: {} }],
    }
  });
  console.log('Grounding Response Snippet:', groundResp.text.substring(0, 150) + '...');
  console.log('Grounding Latency:', Date.now() - groundStart, 'ms');
  
  // 3. Audio (TTS via Gemini 2.0 Flash)
  console.log('\n[3] Audio Generation (Gemini 2.0 Flash)');
  const audioStart = Date.now();
  try {
    const audioResp = await ai.models.generateContent({
      model: 'gemini-flash-latest-exp', // using exp as audio generation is newest feature
      contents: 'Di tengah hutan lebat, Kancil sedang mencari air minum.',
      config: {
        responseModalities: ["AUDIO"],
      }
    });
    console.log('Audio Response:', audioResp.candidates[0].content.parts.length, 'parts received');
    const audioPart = audioResp.candidates[0].content.parts.find(p => p.inlineData?.mimeType?.startsWith('audio/'));
    if (audioPart && audioPart.inlineData) {
        fs.writeFileSync('content/assets/candidates/voices/test_kancil.wav', Buffer.from(audioPart.inlineData.data, 'base64'));
        console.log('Audio saved to content/assets/candidates/voices/test_kancil.wav');
    }
  } catch (e: any) {
    console.error('Audio Generation Failed:', e.message);
  }
  console.log('Audio Latency:', Date.now() - audioStart, 'ms');
  
  // 4. Image Generation (Imagen 3)
  console.log('\n[4] Image Generation (Imagen 3)');
  const imgStart = Date.now();
  try {
    const imgResp = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: 'A cute Indonesian mouse deer (Kancil) in a mystical forest, digital art style, square, high quality',
      config: {
        responseModalities: ["IMAGE"],
      }
    });
    console.log('Image Response received!');
  } catch (e: any) {
    console.error('Image Generation Failed:', e.message);
  }
  console.log('Image Latency:', Date.now() - imgStart, 'ms');
}

run().catch(console.error);
