import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const adaptCheckStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: adaptation } = await ctx.supabase
    .from("adaptations")
    .select("*, version:story_versions(*, story:stories(*))")
    .eq("id", job.ref_id)
    .single();

  if (!adaptation) throw new Error("Adaptation not found");

  // Get adapted pages
  const { data: adaptedPages } = await ctx.supabase
    .from("pages")
    .select("idx, text")
    .eq("adaptation_id", adaptation.id)
    .order("idx", { ascending: true });

  // Get original pages
  const { data: asliAdapt } = await ctx.supabase
    .from("adaptations")
    .select("id")
    .eq("version_id", adaptation.version_id)
    .eq("age_band", "asli")
    .single();
    
  const { data: asliPages } = await ctx.supabase
    .from("pages")
    .select("idx, text")
    .eq("adaptation_id", asliAdapt.id)
    .order("idx", { ascending: true });

  const schema = z.object({
    faithful: z.boolean(),
    issues: z.array(z.string())
  });

  const prompt = `Periksa apakah cerita hasil adaptasi (versi disederhanakan) tetap setia pada cerita asli.
Periksa hal berikut:
1. Nama tokoh utama tidak berubah.
2. Alur cerita inti tetap sama dari awal hingga akhir.
3. Pesan moral atau akhir cerita tidak diubah maknanya.

Teks Asli:
${JSON.stringify(asliPages.map((p: any) => p.text))}

Teks Adaptasi:
${JSON.stringify(adaptedPages.map((p: any) => p.text))}
`;

  const result = await registry.generateJSON(schema, {
    provider: "gemini", // or zai for cheaper check
    model: "gemini-3.6-flash",
    prompt,
    systemInstruction: "Kamu adalah penilai kualitas teks. Berikan 'faithful: true' jika adaptasi setia pada sumbernya, atau berikan daftar 'issues' jika melenceng.",
    stage: "adapt_check",
    ref: job.ref_id
  });

  if (!result.faithful) {
    if (job.attempts >= 2) {
        // Gagal kedua kalinya, mark as failed permanently.
        await ctx.supabase.from("adaptations").update({ status: 'failed' }).eq('id', adaptation.id);
        throw new Error(`Adapt_check permanently failed after 2 attempts. Issues: ${result.issues.join(", ")}`);
    } else {
        throw new Error(`Adaptation check failed: ${result.issues.join(", ")}`); // Will be retried by runner
    }
  }

  // Lolos check, mark adaptation as ready
  await ctx.supabase.from("adaptations").update({ status: 'ready' }).eq('id', adaptation.id);
};
