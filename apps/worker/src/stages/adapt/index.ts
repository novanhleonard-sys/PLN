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

  // Construct prompt based on new specification
  const prompt = `
TARGET USIA: ${adaptation.age_band} TAHUN

Kamu adalah editor cerita anak berbahasa Indonesia.
Tugasmu adalah menyesuaikan tingkat kesulitan cerita dengan usia pembaca tanpa mengubah identitas cerita.

WAJIB DIPERTAHANKAN:
- nama tokoh utama
- hubungan antar tokoh
- lokasi penting
- urutan peristiwa inti
- hubungan sebab-akibat
- konflik utama
- ending
- asal-usul yang dijelaskan cerita
- pesan moral
- unsur budaya penting
- unsur supernatural penting

DILARANG:
- mengarang peristiwa baru
- menghapus peristiwa inti
- mengubah ending
- mengubah pesan moral
- mengubah penyebab kejadian penting
- mengganti siapa melakukan suatu tindakan
- mengubah hubungan antar tokoh
- mengganti unsur budaya menjadi konsep modern generik
- menghilangkan unsur supernatural hanya karena sulit dipahami
- menambahkan fakta budaya yang tidak ada di sumber

TINDAKAN MINIMUM (saat teks sulit dipahami):
- KEEP: pertahankan.
- SIMPLIFY: sederhanakan bahasa atau struktur kalimat.
- EXPLAIN: pertahankan istilah penting dan beri konteks singkat secara natural (misal: "Seorang pertapa, orang yang hidup menyendiri untuk berdoa..."). Jangan ganti "pertapa" jadi "orang".
- SOFTEN: pertahankan kejadian tetapi kurangi detail grafis, mengganggu, atau terlalu intens.

KONTEN SENSITIF:
Jika cerita mengandung kematian, kutukan, hukuman, kekerasan, ancaman, pengkhianatan, ketakutan, atau bahaya supernatural penting, pertahankan faktanya. Sesuaikan penyampaiannya, bukan kenyataannya. Jangan menggunakan euphemism yang menyesatkan (misal: ganti "meninggal" jadi "tidur selamanya" itu DILARANG). Kurangi detail sensory sesuai target.

PANDUAN BAHASA:
Gunakan Bahasa Indonesia alami. Jangan terasa seperti ringkasan. Jangan membuat kalimat patah-patah/mengejar jumlah kata.

ATURAN KHUSUS USIA ${adaptation.age_band}:
- KOSAKATA & STRUKTUR: ${rules.vocab_note}
- KONTEN SENSITIF & PELEMBUTAN: ${rules.soften_rules}
- PANJANG KALIMAT MAKS (PANDUAN): ${rules.max_sentence_words} kata (bukan batas keras)
- WAJIB DIPERTAHANKAN: ${rules.must_keep}

FORMAT HALAMAN (PENTING!):
Pertahankan jumlah halaman TEPAT SAMA dengan input (${asliPages.length} halaman).
Setiap halaman output wajib:
- menggunakan idx yang sama persis
- mempertahankan fungsi naratif halaman tersebut
- tidak digabung dengan halaman lain
- tidak dipecah menjadi halaman baru

TEKS ASLI (JSON Array Halaman):
${originalPagesJSON}
`;

  console.log(`Calling Gemini for adaptation ${adaptation.age_band}...`);
  const result = await registry.generateJSON(schema, {
    provider: "gemini",
    model: "gemini-3.1-flash-lite", // Use flash instead of flash-lite for reasoning ability on complex constraints
    prompt,
    systemInstruction: "Kamu adalah editor cerita anak berbahasa Indonesia yang teliti dan patuh pada instruksi.",
    stage: "adapt",
    ref: job.id
  });

  const adaptedPages = result.pages;
  
  if (adaptedPages.length !== asliPages.length) {
      throw new Error(`Output pages count mismatch. Expected ${asliPages.length}, got ${adaptedPages.length}`);
  }

  // Insert pages
  const pagesToInsert = adaptedPages.map((p: any) => {
      const originalPage = asliPages.find((op: any) => op.idx === p.idx);
      if (!originalPage) throw new Error(`Missing original page for idx ${p.idx}`);
      return {
          adaptation_id: adaptation.id,
          idx: p.idx,
          text: p.adapted_text,
          scene_id: originalPage.scene_id
      };
  });

  const { error: insertError } = await ctx.supabase.from("pages").insert(pagesToInsert);
  if (insertError) throw insertError;

  const { error: updateError } = await ctx.supabase.from("adaptations").update({ total_pages: pagesToInsert.length }).eq("id", adaptation.id);
  if (updateError) throw updateError;

  // Enqueue adapt_check
  const { error: jobError } = await ctx.supabase.from("jobs").insert({
      kind: "adapt_check",
      ref_type: "adaptation",
      ref_id: adaptation.id,
      process_run_id: job.process_run_id,
      idempotency_key: `adapt_check_${job.process_run_id || ""}_${adaptation.id}`
  });

  if (jobError) throw jobError;
};
