import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const adaptStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: adaptation } = await ctx.supabase
    .from("adaptations")
    .select("*, version:story_versions(*, story:stories(*))")
    .eq("id", job.ref_id)
    .single();

  if (!adaptation) throw new Error("Adaptation not found");

  const version_id = adaptation.version_id;

  const { data: asliAdapt } = await ctx.supabase
    .from("adaptations")
    .select("id")
    .eq("version_id", version_id)
    .eq("age_band", "asli")
    .single();

  if (!asliAdapt) throw new Error("Original adaptation not found");

  const { data: asliPages } = await ctx.supabase
    .from("pages")
    .select("idx, text, scene_id")
    .eq("adaptation_id", asliAdapt.id)
    .order("idx", { ascending: true });

  if (!asliPages || asliPages.length === 0) throw new Error("Original pages not found");

  const { data: rules } = await ctx.supabase
    .from("age_band_rules")
    .select("*")
    .eq("band", adaptation.age_band)
    .single();

  if (!rules) throw new Error("Age band rules not found");

  const originalPagesJSON = JSON.stringify(asliPages.map((p: any) => ({ idx: p.idx, text: p.text })));

  const schema = z.object({
    summary: z.string(),
    pages: z.array(z.object({
      idx: z.number(),
      adapted_text: z.string()
    })).length(asliPages.length)
  });

  const prompt = `Anda bertugas mengadaptasi teks cerita rakyat agar sesuai untuk anak usia ${adaptation.age_band} tahun.
  
ATURAN ADAPTASI:
- Panjang kalimat maksimal: ${rules.max_sentence_words || 'bebas'} kata per kalimat.
- Catatan kosakata: ${rules.vocab_note || 'gunakan kosakata umum'}.
- Aturan pelembutan: ${rules.soften_rules || 'tidak ada'}.
- Harus dipertahankan: ${rules.must_keep || 'tidak ada'}.

JUMLAH HALAMAN HARUS TEPAT ${asliPages.length}. Jangan menambah atau mengurangi halaman. Pertahankan indeks halaman yang sama dengan teks asli.

TEKS ASLI (JSON):
${originalPagesJSON}
`;

  console.log(`Calling Gemini for adaptation ${adaptation.age_band}...`);
  const result = await registry.generateJSON(schema, {
    provider: "gemini",
    model: "gemini-3.6-flash",
    prompt,
    systemInstruction: "Kamu adalah spesialis sastra anak yang ahli menyederhanakan teks.",
    stage: "adapt",
    ref: job.ref_id
  });

  const adaptedPages = result.pages;
  
  if (adaptedPages.length !== asliPages.length) {
      throw new Error(`Output pages count mismatch. Expected ${asliPages.length}, got ${adaptedPages.length}`);
  }

  // Insert pages
  const pagesToInsert = adaptedPages.map((p: any) => {
      // Find corresponding scene_id from asli
      const originalPage = asliPages.find((op: any) => op.idx === p.idx);
      return {
          adaptation_id: adaptation.id,
          idx: p.idx,
          text: p.adapted_text,
          scene_id: originalPage.scene_id
      };
  });

  const { error: insertError } = await ctx.supabase.from("pages").insert(pagesToInsert);
  if (insertError) throw insertError;

  // Enqueue adapt_check
  const { error: jobError } = await ctx.supabase.from("jobs").insert({
      kind: "adapt_check",
      ref_type: "adaptation",
      ref_id: adaptation.id,
      idempotency_key: `adapt_check:${adaptation.id}`
  });

  if (jobError) throw jobError;
};
