import { AIProvider } from '../../providers/registry';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export const audioStage = async (ctx: any, job: any, registry?: any) => {
  // Fetch the page with adaptation and version
  const { data: page, error: pageErr } = await ctx.supabase
    .from("pages")
    .select("*, adaptation:adaptations(*, version:story_versions(*, story:stories(*)))")
    .eq("id", job.ref_id)
    .single();

  if (pageErr || !page) {
    throw new Error("Page not found: " + (pageErr?.message || ""));
  }

  // Get persona
  let { data: persona, error: personaErr } = await ctx.supabase
    .from("voice_personas")
    .select("*")
    .eq("story_type", page.adaptation.version.story.type)
    .limit(1)
    .maybeSingle();
    
  if (!persona) {
    const { data: fb } = await ctx.supabase.from("voice_personas").select("*").limit(1).single();
    persona = fb;
  }

  const voiceName = persona?.voice_name || "Aoede";

  console.log(`Generating audio for ${page.adaptation.version.story.title} (Page ${page.idx}) using voice ${voiceName}...`);

  // Call GeminiProvider.generateAudio
  if (!registry) {
    throw new Error("Registry is required for audio generation");
  }

  const audioBase64 = await registry.generateAudio({
    provider: 'gemini',
    model: 'gemini-2.5-flash-preview-tts',
    prompt: page.text,
    voiceName: voiceName,
    ref: job.id,
    stage: 'audio'
  });

  // Save base64 to temp file
  const tempWav = path.join(os.tmpdir(), `temp_${job.id}.pcm`);
  const tempOgg = path.join(os.tmpdir(), `audio_${job.id}.ogg`);
  fs.writeFileSync(tempWav, Buffer.from(audioBase64, 'base64'));

  try {
    // Convert to Opus using ffmpeg
    // Gemini returns audio/L16;codec=pcm;rate=24000 (16-bit PCM, 24kHz, mono)
    await execAsync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i ${tempWav} -c:a libopus -b:a 32k ${tempOgg}`);

    // Upload to Supabase Storage
    const oggBuffer = fs.readFileSync(tempOgg);
    const audioPath = `page_audio_${page.id}.ogg`;
    
    const { error: uploadErr } = await ctx.supabase.storage
      .from("audio")
      .upload(audioPath, oggBuffer, { upsert: true, contentType: "audio/ogg" });

    if (uploadErr) {
      throw new Error("Failed to upload audio: " + uploadErr.message);
    }

    // Upsert to page_audio table
    const { data: existingAudio } = await ctx.supabase
      .from("page_audio")
      .select("id")
      .eq("page_id", page.id)
      .maybeSingle();

    if (existingAudio) {
      await ctx.supabase.from("page_audio").update({
        path: audioPath,
        persona_id: persona?.id,
        status: "ready"
      }).eq("id", existingAudio.id);
    } else {
      const { error: insErr } = await ctx.supabase.from("page_audio").insert({
        page_id: page.id,
        persona_id: persona?.id,
        path: audioPath,
        status: "ready"
      });
      if (insErr) throw new Error("Failed to insert page_audio: " + insErr.message);
    }

    // Update page audio_status
    await ctx.supabase.from("pages").update({ audio_status: "ready" }).eq("id", page.id);

    // Update job status
    await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
    console.log("Audio generation succeeded for page", page.id);
  } finally {
    // Cleanup
    if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
    if (fs.existsSync(tempOgg)) fs.unlinkSync(tempOgg);
  }
};
