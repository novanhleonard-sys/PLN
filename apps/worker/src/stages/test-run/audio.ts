import { SupabaseClient } from '@supabase/supabase-js';
import { ProviderRegistry } from '../../providers/registry';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export const testAudioStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
  const testRunId = job.ref_id;

  const { data: testRun, error: fetchError } = await ctx.supabase
    .from('test_runs')
    .select('*')
    .eq('id', testRunId)
    .single();

  if (fetchError || !testRun) {
    throw new Error('Test run not found: ' + (fetchError?.message || testRunId));
  }

  await ctx.supabase.from('test_runs').update({ status: 'running', error: null }).eq('id', testRunId);

  try {
    const { data: umum } = await ctx.supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'umum_suara')
      .maybeSingle();

    const umumPrompt = umum?.value?.prompt || '';

    let stylePrompt = testRun.config_snapshot?.style_prompt;
    let voiceName = testRun.config_snapshot?.voice_name;

    if ((!stylePrompt || !voiceName) && testRun.voice_id) {
      const { data: persona } = await ctx.supabase
        .from('voice_personas')
        .select('*')
        .eq('id', testRun.voice_id)
        .maybeSingle();

      if (persona) {
        if (!stylePrompt) stylePrompt = persona.style_prompt;
        if (!voiceName) voiceName = persona.voice_name;
      }
    }

    voiceName = (voiceName || '').trim() || 'Aoede';

    const finalInstruction = [
      umumPrompt,
      stylePrompt ? `Instruksi Persona Suara:\n${stylePrompt}` : ''
    ].filter(Boolean).join('\n\n');

    console.log(`[testAudioStage] Generating test audio for test_run ${testRunId} using voice ${voiceName}...`);

    const audioBase64 = await registry.generateAudio({
      systemInstruction: finalInstruction,
      provider: 'gemini',
      model: 'gemini-3.8-flash-tts',
      prompt: testRun.text_prompt,
      voiceName,
      ref: job.id,
      stage: 'test_audio'
    });

    const tempPcm = path.join(os.tmpdir(), `test_${testRunId}_${Date.now()}.pcm`);
    const tempOgg = path.join(os.tmpdir(), `test_${testRunId}_${Date.now()}.ogg`);
    fs.writeFileSync(tempPcm, Buffer.from(audioBase64, 'base64'));

    try {
      await execAsync(`ffmpeg -y -i "${tempPcm}" -c:a libopus -b:a 32k "${tempOgg}"`, { timeout: 30000 });
      const oggBuffer = fs.readFileSync(tempOgg);
      const storagePath = `test-runs/${testRunId}_${Date.now()}.ogg`;

      const { error: uploadError } = await ctx.supabase.storage
        .from('admin-assets')
        .upload(storagePath, oggBuffer, { upsert: true, contentType: 'audio/ogg' });

      if (uploadError) {
        throw new Error('Upload audio failed: ' + uploadError.message);
      }

      const { data: publicUrlData } = ctx.supabase.storage.from('admin-assets').getPublicUrl(storagePath);

      await ctx.supabase.from('test_runs').update({
        status: 'succeeded',
        result_url: publicUrlData.publicUrl,
        error: null
      }).eq('id', testRunId);

      console.log(`[testAudioStage] Test audio completed for test_run ${testRunId}: ${publicUrlData.publicUrl}`);
    } finally {
      if (fs.existsSync(tempPcm)) {
        try { fs.unlinkSync(tempPcm); } catch (e: any) { console.warn('Failed to delete temp pcm:', e.message); }
      }
      if (fs.existsSync(tempOgg)) {
        try { fs.unlinkSync(tempOgg); } catch (e: any) { console.warn('Failed to delete temp ogg:', e.message); }
      }
    }
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown error occurred during test audio generation';
    console.error(`[testAudioStage] Error for test_run ${testRunId}:`, errorMsg);
    await ctx.supabase.from('test_runs').update({
      status: 'failed',
      error: errorMsg
    }).eq('id', testRunId);
    throw err;
  }
};
