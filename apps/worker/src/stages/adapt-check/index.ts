import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const adaptCheckStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: adaptation } = await ctx.supabase
    .from("adaptations")
    .select("*, version:story_versions(*, story:stories(*))")
    .eq("id", job.ref_id)
    .single();

  if (!adaptation) throw new Error("Adaptation not found");

  // Get original pages
  const { data: asliAdapt } = await ctx.supabase
    .from("adaptations")
    .select("id")
    .eq("version_id", adaptation.version_id)
    .eq("age_band", "asli")
    .single();
    
  const { data: asliPages } = await ctx.supabase
    .from("pages")
    .select("idx, text, scene_id")
    .eq("adaptation_id", asliAdapt.id)
    .order("idx", { ascending: true });

  const { data: rules } = await ctx.supabase
    .from("age_band_rules")
    .select("*")
    .eq("band", adaptation.age_band)
    .single();

  const originalPagesJSON = JSON.stringify(asliPages.map((p: any) => ({ idx: p.idx, text: p.text })));

  const schema = z.object({
    passed: z.boolean(),
    issues: z.array(z.string()),
    checks: z.object({
      characters: z.string(),
      locations: z.string(),
      plot: z.string(),
      causal_chain: z.string(),
      ending: z.string(),
      moral: z.string(),
      vocabulary: z.string(),
      syntax: z.string(),
      inference_load: z.string(),
      sensitive_content: z.string(),
      cultural_integrity: z.string(),
      writing_quality: z.string()
    })
  });

  const checkPromptBase = `Periksa adaptasi cerita anak untuk usia ${adaptation.age_band} tahun ini.

TUGASMU: Evaluasi 4 domain (Fidelity, Age Fit, Cultural Integrity, Writing Quality).
Kembalikan JSON dengan "passed": true jika semua syarat terpenuhi.
Jika gagal, sebutkan detail masalah di array "issues". Pada "checks", tulis "pass" atau detail pelanggarannya.

TEKS ASLI:
${originalPagesJSON}

TEKS ADAPTASI SAAT INI:
`;

  let attempts = 0;
  const maxAttempts = 2; // 1 initial check, up to 1 repair attempt.

  while (attempts < maxAttempts) {
    attempts++;

    // Get current adapted pages
    const { data: currentAdapted } = await ctx.supabase
      .from("pages")
      .select("id, idx, text")
      .eq("adaptation_id", adaptation.id)
      .order("idx", { ascending: true });
      
    const currentAdaptedJSON = JSON.stringify(currentAdapted.map((p: any) => ({ idx: p.idx, text: p.text })));

    const result = await registry.generateJSON(schema, {
      provider: "gemini",
      model: "gemini-1.5-flash",
      prompt: checkPromptBase + currentAdaptedJSON,
      systemInstruction: "Kamu adalah penilai kualitas teks sastra anak yang ketat (Auditor).",
      stage: "adapt_check",
      ref: job.id
    });

    if (result.passed) {
      console.log(`Adapt check passed for ${adaptation.id}`);
      await ctx.supabase.from("adaptations").update({ status: 'ready' }).eq('id', adaptation.id);
      return; // DONE
    }

    console.log(`Adapt check failed for ${adaptation.id}. Issues:`, result.issues);

    if (attempts >= maxAttempts) {
      console.log(`Max repair attempts reached for ${adaptation.id}, marking failed.`);
      await ctx.supabase.from("adaptations").update({ status: 'failed' }).eq('id', adaptation.id);
      throw new Error(`Adaptation check permanently failed. Issues: ${result.issues.join("; ")}`);
    }

    // --- REPAIR PROCESS ---
    console.log(`Attempting repair for ${adaptation.id}...`);
    const repairSchema = z.object({
        pages: z.array(z.object({
            idx: z.number(),
            adapted_text: z.string()
        })).length(asliPages.length)
    });

    const repairPrompt = `
TARGET USIA: ${adaptation.age_band} TAHUN

Adaptasi sebelumnya GAGAL memenuhi standar. 
TUGASMU: Perbaiki HANYA masalah yang disebutkan, sambil mempertahankan hal-hal yang sudah benar.
JANGAN merombak total jika tidak perlu. Tetap pertahankan jumlah halaman tepat sama dengan aslinya.

MASALAH YANG HARUS DIPERBAIKI:
${result.issues.map((i: string) => "- " + i).join("\n")}

TEKS ASLI (SEBAGAI REFERENSI):
${originalPagesJSON}

TEKS ADAPTASI YANG GAGAL (PERBAIKI INI):
${currentAdaptedJSON}
`;

    const repairResult = await registry.generateJSON(repairSchema, {
      provider: "gemini",
      model: "gemini-1.5-flash", // Use a capable model for targeted repair
      prompt: repairPrompt,
      systemInstruction: "Kamu adalah editor perbaikan. Perbaiki adaptasi berdasarkan feedback auditor.",
      stage: "adapt_repair",
      ref: job.id
    });

    // Save repaired pages
    for (const page of repairResult.pages) {
       const existingPage = currentAdapted.find((p: any) => p.idx === page.idx);
       if (existingPage) {
           await ctx.supabase.from("pages").update({ text: page.adapted_text }).eq("id", existingPage.id);
       }
    }
  }
};
