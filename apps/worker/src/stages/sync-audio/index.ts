export const syncAudioStage = async (ctx: any, job: any) => {
  const versionId = job.ref_id;

  // 1. Get adaptations for this version
  const { data: adaptations, error: adErr } = await ctx.supabase
    .from("adaptations")
    .select("id, age_band, language, pages(id)")
    .eq("version_id", versionId);

  if (adErr || !adaptations) {
    throw new Error("Failed to fetch adaptations: " + (adErr?.message || ""));
  }

  // 2. We ONLY want to generate audio for the 'asli' ID adaptation
  let targetAdaptation = adaptations.find((a: any) => a.age_band === "asli" && a.language === "id");
  if (!targetAdaptation) {
    targetAdaptation = adaptations.find((a: any) => a.language === "id") || adaptations[0];
  }

  if (!targetAdaptation || !targetAdaptation.pages || targetAdaptation.pages.length === 0) {
    await ctx.supabase.from("jobs").update({ status: "succeeded", error: "No pages found for asli adaptation" }).eq("id", job.id);
    return;
  }

  // 3. For each page in the target adaptation, enqueue an `audio` job if it doesn't already have a successful one
  let totalQueued = 0;
  for (const page of targetAdaptation.pages) {
    // Check if it already has a page_audio
    const { data: pageAudio } = await ctx.supabase
      .from("page_audio")
      .select("id, status")
      .eq("page_id", page.id)
      .maybeSingle();

    if (!pageAudio || pageAudio.status === "failed") {
      const idempotencyKey = `audio_${job.process_run_id}_${page.id}`;
      const { error: insErr } = await ctx.supabase.from("jobs").insert({
        kind: "audio",
        ref_type: "page",
        ref_id: page.id,
        process_run_id: job.process_run_id,
        status: "queued",
        idempotency_key: idempotencyKey
      });

      if (insErr && insErr.code !== '23505') { // Ignore unique constraint violation
        console.error("Failed to enqueue audio job for page", page.id, insErr);
      } else {
        totalQueued++;
      }
    }
  }

  console.log(`Queued ${totalQueued} audio jobs for adaptation ${targetAdaptation.id}`);
  
  // 4. Update the sync_audio job to succeeded
  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};
