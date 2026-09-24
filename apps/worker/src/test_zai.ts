import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';
globalThis.WebSocket = WebSocket as any;
import { ZaiProvider } from './providers/zai';
import { z } from 'zod';

dotenv.config({ path: '../../.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const zai = new ZaiProvider();

async function run() {
  const schema = z.object({
    isValid: z.boolean(),
    originalStory: z.string().describe("Teks cerita yang sudah diperbaiki tata bahasanya, tetap orisinal"),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      name: z.string()
    }).describe("Titik koordinat geografis di mana cerita ini terjadi"),
    confidence: z.number(),
    reason: z.string()
  });

  const { data: submission } = await supabase.from("submissions").select("*").eq("title", "Kancil dan Buaya").single();

  const prompt = "Verifikasi kebenaran cerita rakyat ini:\nJudul: " + submission.title + "\nCerita: " + submission.body + "\nSumber: " + JSON.stringify(submission.sources) + "\nSilakan verifikasi apakah cerita ini otentik. Jika ya, berikan lokasi geografisnya yang paling tepat. Jika tidak otentik, tolak.";

  console.log("Calling Zai for verify...", submission.title);
  const result = await zai.generateJSON("glm-5.3-flash", prompt, schema, "Anda adalah verifikator ahli folklor Nusantara.");
  console.log("Result:", result.data);
}
run();
