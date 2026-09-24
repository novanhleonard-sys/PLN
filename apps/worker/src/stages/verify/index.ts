import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const verifyStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: submission } = await ctx.supabase.from("submissions").select("*").eq("id", job.ref_id).single();
  if (!submission) throw new Error("Submission not found");

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

  const prompt = "Verifikasi kebenaran cerita rakyat ini:\nJudul: " + submission.title + "\nCerita: " + submission.body + "\nSumber: " + JSON.stringify(submission.sources) + "\nSilakan gunakan Google Search untuk memverifikasi apakah cerita ini otentik. Jika ya, berikan lokasi geografisnya yang paling tepat (misal Rawa Pening). Jika tidak otentik, tolak.";

  console.log("Calling Gemini for verify...", submission.title);
  const result = await registry.generateJSON(schema, {
    provider: "gemini",
    model: "gemini-3.6-flash",
    prompt,
    systemInstruction: "Anda adalah verifikator ahli folklor Nusantara. Lakukan pencarian web untuk memvalidasi folklor, lalu kembalikan JSON hasil verifikasi dengan lokasi akurat (lat, lng).",
    ref: submission.id,
    stage: "verify",
    useSearchGrounding: true
  });
  
  console.log("Verify Result:", result.isValid, result.reason, result.location);
  
  // Apply verdict
  await ctx.supabase.from("verification_runs").insert({
    submission_id: submission.id,
    verdict: result,
    created_at: new Date().toISOString()
  });

  if (result.isValid) {
    const slug = submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data: story, error: storyErr } = await ctx.supabase.from("stories").upsert({
      title: submission.title,
      slug: slug,
      type: 'dongeng',
      synopsis: result.reason,
      lat: result.location.lat,
      lng: result.location.lng,
      status: 'published'
    }, { onConflict: 'slug' }).select().single();
    
    if (storyErr) console.error("Story Upsert Error:", storyErr);

    if (story) {
      const { data: version, error: versionErr } = await ctx.supabase.from("story_versions").insert({
        story_id: story.id,
        label: 'Asli',
        sources: submission.sources || [],
        body: result.originalStory,
        status: "processing"
      }).select().single();

      if (versionErr) console.error("Version Insert Error:", versionErr);

      if (version) {
        await ctx.supabase.from("jobs").insert({
          kind: "segment",
          ref_type: "story_version",
          ref_id: version.id,
          status: "queued",
          attempts: 0,
          cost_usd: 0,
          run_after: new Date().toISOString(),
          idempotency_key: "segment_" + version.id
        });
      }
    }
  }

  // Update submission status
  await ctx.supabase.from("submissions").update({ status: result.isValid ? 'approved' : 'rejected' }).eq("id", submission.id);
  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};



