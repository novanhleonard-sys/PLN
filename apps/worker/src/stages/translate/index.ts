import { StageContract } from '../../core/runner';
import { ProviderRegistry } from '../../providers/registry';
import { z } from 'zod';

const TranslateSchema = z.object({
  summary: z.string(),
  pages: z.array(z.object({
    idx: z.number().int(),
    translated_text: z.string()
  }))
});

export const translateStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  // 1. Get the English adaptation record
  const { data: enAdaptation, error: aErr } = await ctx.supabase
    .from('adaptations')
    .select('*, version:story_versions(story:stories(title, region_id))')
    .eq('id', job.ref_id)
    .single();

  if (aErr || !enAdaptation) throw new Error(`Adaptation not found: ${job.ref_id}`);
  
  if (enAdaptation.language !== 'en') {
      throw new Error(`translateStage called for language ${enAdaptation.language}`);
  }

  // 2. Find the Source adaptation (ID)
  const { data: sourceAdaptation, error: sErr } = await ctx.supabase
    .from('adaptations')
    .select('id, status')
    .eq('version_id', enAdaptation.version_id)
    .eq('age_band', enAdaptation.age_band)
    .eq('language', 'id')
    .single();

  if (sErr || !sourceAdaptation) {
      throw new Error('Source adaptation (ID) not found');
  }
  
  if (sourceAdaptation.status !== 'ready') {
      throw new Error('Source adaptation (ID) is not ready yet');
  }

  // 3. Fetch source pages
  const { data: sourcePages, error: pErr } = await ctx.supabase
    .from('pages')
    .select('idx, text, scene_id')
    .eq('adaptation_id', sourceAdaptation.id)
    .order('idx', { ascending: true });

  if (pErr || !sourcePages || sourcePages.length === 0) {
      throw new Error('Source pages not found');
  }

  // 4. Construct AI Prompt
  const systemPrompt = `Kamu adalah penerjemah cerita anak Indonesia ke Bahasa Inggris.

Terjemahkan teks secara natural, bukan kata-per-kata.

Pertahankan:
- nama tokoh
- lokasi
- urutan kejadian
- ending
- moral
- istilah budaya penting
- unsur supernatural penting

Ikuti tingkat kesulitan bahasa dari teks sumber.
Jangan membuat hasil lebih sulit dari source adaptation.

Istilah budaya Indonesia sebisa mungkin dipertahankan dan diberi penjelasan singkat secara natural bila diperlukan.

Jangan mengarang fakta baru.
Jangan mengubah kejadian.
Jangan mengubah makna.

Gunakan English yang natural dan mudah dibaca anak sesuai tingkat source.

Pertahankan jumlah halaman dan idx yang sama persis dengan input.`;

  const inputJson = JSON.stringify(sourcePages.map((p: any) => ({ idx: p.idx, text: p.text })), null, 2);
  
  // 5. Call AI
  const result = await registry.generateJSON(TranslateSchema, {
      ref: job,
      model: 'gemini-3.1-flash-lite',
      provider: 'gemini',
      stage: 'translate', 
      systemInstruction: systemPrompt, 
      prompt: `Terjemahkan teks cerita ini ke Bahasa Inggris sesuai aturan:\n\n${inputJson}`
  });
  
  // 6. Validate result
  if (result.pages.length !== sourcePages.length) {
      throw new Error(`Page count mismatch: expected ${sourcePages.length}, got ${result.pages.length}`);
  }

  // 7. Save pages
  const newPages = sourcePages.map((src: any) => {
      const translatedPage = result.pages.find((p: any) => p.idx === src.idx);
      if (!translatedPage) {
          throw new Error(`Missing translation for page idx ${src.idx}`);
      }
      return {
          adaptation_id: enAdaptation.id,
          idx: src.idx,
          text: translatedPage.translated_text,
          scene_id: src.scene_id
      };
  });

  const { error: insErr } = await ctx.supabase.from('pages').insert(newPages);
  if (insErr) throw insErr;

  // 8. Mark ready
  await ctx.supabase.from('adaptations').update({ status: 'ready', total_pages: newPages.length }).eq('id', enAdaptation.id);
};

