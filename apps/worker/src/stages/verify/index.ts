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
    confidence: z.number().min(0).max(1).describe("Nilai 0 sampai 1 sejauh mana AI yakin ini cerita valid"),
    reason: z.string()
  });

  const prompt = "Verifikasi kebenaran cerita rakyat ini:\nJudul: " + submission.title + "\nCerita: " + submission.body + "\nSumber: " + JSON.stringify(submission.sources) + "\nSilakan gunakan Google Search untuk memverifikasi apakah cerita ini otentik. Jika ya, berikan lokasi geografisnya yang paling tepat (misal Rawa Pening). Jika tidak otentik, tolak.";

  console.log("Calling Gemini for verify...", submission.title);
  const result = await registry.generateJSON(schema, {
    provider: "zai",
    model: "glm-4-flash",
    prompt,
    systemInstruction: "Anda adalah verifikator ahli folklor Nusantara. Lakukan pencarian web untuk memvalidasi folklor, lalu kembalikan JSON hasil verifikasi dengan lokasi akurat (lat, lng).",
    ref: job.id,
    stage: "verify",
    useSearchGrounding: true
  });
  
  console.log("Verify Result:", result.isValid, result.reason, result.location, result.confidence);
  
  // Apply verdict
  await ctx.supabase.from("verification_runs").insert({
    submission_id: submission.id,
    verdict: result,
    created_at: new Date().toISOString()
  });

  // Fetch app settings to decide auto-publish
  const { data: appSettings } = await ctx.supabase.from("app_settings").select("key, value").eq("key", "moderation").single();
  
  let autoPublishEnabled = false;
  let rawConf = 80;
  if (appSettings && appSettings.value) {
    autoPublishEnabled = !!appSettings.value.autoPublish;
    rawConf = appSettings.value.confidenceThreshold || 80;
  }
  const minConfDecimal = rawConf / 100;

  console.log(`Auto Publish Settings: Enabled=${autoPublishEnabled}, MinConf=${minConfDecimal}`);

  let finalStatus = 'needs_review';
  
  if (result.isValid && result.confidence >= minConfDecimal && autoPublishEnabled) {
    finalStatus = 'approved';
  } else if (!result.isValid && result.confidence >= minConfDecimal) {
    finalStatus = 'rejected';
  } else {
    finalStatus = 'needs_review';
  }

  // Update submission status based on rules
  await ctx.supabase.from("submissions").update({ status: finalStatus }).eq("id", submission.id);

  if (finalStatus === 'approved') {
    const slug = submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { data: story, error: storyErr } = await ctx.supabase.from("stories").upsert({
      title: submission.title,
      slug: slug,
      type: 'dongeng',
      synopsis: submission.synopsis || result.reason,
      lat: submission.lat || result.location.lat,
      lng: submission.lng || result.location.lng,
      hero_image_path: submission.hero_image_path || null,
      pin_image_path: submission.pin_image_path || null,
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
        const { error: runErr } = await ctx.supabase.rpc('start_ai_process_run', {
           p_version_id: version.id,
           p_scope: 'all',
           p_config_snapshot: { source: 'auto-approve' }
        });
        if (runErr) console.error("Process Run Start Error:", runErr);
      }
    }
  }

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};

