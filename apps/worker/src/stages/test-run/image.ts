import { SupabaseClient } from '@supabase/supabase-js';
import { ProviderRegistry } from '../../providers/registry';

export const testImageStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
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
      .eq('key', 'umum_gambar')
      .maybeSingle();

    const umumPrompt = umum?.value?.prompt || '';
    const umumRefs: string[] = umum?.value?.references || [];

    let descriptor = testRun.config_snapshot?.descriptor;
    let referencePaths: string[] = testRun.config_snapshot?.reference_paths || [];

    if ((!descriptor || referencePaths.length === 0) && testRun.style_id) {
      const { data: style } = await ctx.supabase
        .from('style_configs')
        .select('*')
        .eq('id', testRun.style_id)
        .maybeSingle();

      if (style) {
        if (!descriptor) descriptor = style.descriptor;
        if (referencePaths.length === 0 && style.reference_paths) referencePaths = style.reference_paths;
      }
    }

    const referenceBase64s: string[] = [];
    const allRefPaths = [...umumRefs, ...referencePaths].filter(Boolean);

    for (const refPath of allRefPaths) {
      try {
        const publicUrl = ctx.supabase.storage.from('admin-assets').getPublicUrl(refPath).data.publicUrl;
        const resp = await fetch(publicUrl);
        if (resp.ok) {
          const arr = await resp.arrayBuffer();
          referenceBase64s.push(Buffer.from(arr).toString('base64'));
        }
      } catch (e: any) {
        console.warn(`Could not fetch test ref image ${refPath}:`, e.message);
      }
    }

    const prompt = [
      umumPrompt ? `Aturan Umum:\n${umumPrompt}` : '',
      descriptor ? `Aturan Gaya Spesifik:\n${descriptor}` : '',
      `Deskripsi Adegan Pengujian:\n${testRun.text_prompt}`,
      'Aturan Tambahan: Komposisi persegi, subjek jelas di tengah dengan margin aman. PENTING: Jangan tambahkan TEKS AI, LABEL, WATERMARK, atau CAPTION apa pun ke dalam gambar.'
    ].filter(Boolean).join('\n\n');

    console.log(`[testImageStage] Generating test image for test_run ${testRunId}...`);

    const resultBase64 = await registry.generateImage({
      provider: 'gemini',
      model: 'gemini-3.1-flash-image',
      prompt,
      referenceImages: referenceBase64s,
      ref: job.id,
      stage: 'test_image'
    });

    if (!resultBase64) {
      throw new Error('Gemini did not return image data for test run');
    }

    const storagePath = `test-runs/${testRunId}_${Date.now()}.png`;
    const fileBuffer = Buffer.from(resultBase64, 'base64');

    const { error: uploadError } = await ctx.supabase.storage
      .from('admin-assets')
      .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: true });

    if (uploadError) {
      throw new Error('Upload failed: ' + uploadError.message);
    }

    const { data: publicUrlData } = ctx.supabase.storage.from('admin-assets').getPublicUrl(storagePath);

    await ctx.supabase.from('test_runs').update({
      status: 'succeeded',
      result_url: publicUrlData.publicUrl,
      error: null
    }).eq('id', testRunId);

    console.log(`[testImageStage] Test image completed for test_run ${testRunId}: ${publicUrlData.publicUrl}`);
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown error occurred during test image generation';
    console.error(`[testImageStage] Error for test_run ${testRunId}:`, errorMsg);
    await ctx.supabase.from('test_runs').update({
      status: 'failed',
      error: errorMsg
    }).eq('id', testRunId);
    throw err;
  }
};
