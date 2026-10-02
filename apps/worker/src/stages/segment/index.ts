import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const segmentStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: version } = await ctx.supabase.from("story_versions").select("*, story:stories(*)").eq("id", job.ref_id).single();
  if (!version) throw new Error("Story version not found");

  const schema = z.object({
    synopsis: z.string(),
    theme: z.string(),
    sensitivity: z.string(),
    characters: z.array(z.object({
      name: z.string(),
      role: z.string(),
      description: z.string()
    })),
    scenes: z.array(z.object({
      idx: z.number(),
      text: z.string(),
      scene_description: z.string(),
      character_names: z.array(z.string())
    }))
  });

  const prompt = "Bagi cerita berikut menjadi 6-14 bagian (scene/halaman). Sertakan sinopsis, tema, sensitivitas, daftar tokoh, dan deskripsi visual yang rinci untuk setiap bagian.\nCerita:\n" + version.body;

  console.log("Calling Gemini for segment...", version.story.title);
  const result = await registry.generateJSON(schema, {
    provider: "gemini",
    model: "gemini-1.5-flash-lite",
    prompt,
    systemInstruction: "Anda adalah pembuat naskah buku anak. Bagi cerita ke bagian-bagian dengan panjang merata. Hasilkan deskripsi visual yang detail untuk tiap bagian agar bisa digambar oleh AI.",
    ref: job.id,
    stage: "segment"
  });

  console.log("Segment OK: scenes=" + result.scenes.length + " chars=" + result.characters.length);

  let scope = 'all';
  if (job.process_run_id) {
    const { data: runData } = await ctx.supabase.from("ai_process_runs").select("scope").eq("id", job.process_run_id).single();
    if (runData) {
      scope = runData.scope;
      console.log("Process run scope:", scope);
    }
  }

  // Idempotency: Clean up existing scenes (cascades to pages if DB is set up, otherwise we manually delete pages)
  // Wait, pages are linked to adaptation, scenes are linked to version.
  // Actually, deleting scenes might not cascade to pages depending on FK. Let's delete pages first.
  const { data: oldScenes } = await ctx.supabase.from("scenes").select("id").eq("version_id", version.id);
  if (oldScenes && oldScenes.length > 0) {
    const oldSceneIds = oldScenes.map((s: any) => s.id);
    await ctx.supabase.from("pages").delete().in("scene_id", oldSceneIds);
    await ctx.supabase.from("scenes").delete().in("id", oldSceneIds);
  }

  // Insert characters (ignore errors - upsert by name+version_id)
  const charMap = new Map<string, string>();
  for (const char of result.characters) {
    // Check if character already exists for this version
    const { data: existing } = await ctx.supabase.from("characters")
      .select("id")
      .eq("name", char.name)
      .eq("version_id", version.id)
      .single();

    if (existing) {
      charMap.set(char.name, existing.id);
    } else {
      const { data: charData, error: charErr } = await ctx.supabase.from("characters").insert({
        name: char.name,
        descriptor: char.description || char.role,
        scope: "version",
        version_id: version.id
      }).select().single();
      if (charErr) console.warn("Character insert warn:", charErr.message);
      if (charData) charMap.set(char.name, charData.id);
    }
  }

  // Ensure adaptation 'asli' exists
  let { data: adaptation } = await ctx.supabase.from("adaptations")
    .select("id")
    .eq("version_id", version.id)
    .eq("age_band", "asli")
    .single();

  if (!adaptation) {
    const { data: newAdaptation, error: adaptErr } = await ctx.supabase.from("adaptations").insert({
      version_id: version.id,
      age_band: "asli",
      prompt_version: "v1",
      status: "ready"
    }).select().single();
    if (adaptErr) throw new Error("Failed to create adaptation: " + adaptErr.message);
    adaptation = newAdaptation;
  }

  // Insert scenes and pages
  for (const scene of result.scenes) {
    const charIds = scene.character_names
      .map(name => charMap.get(name))
      .filter(id => id) as string[];

    const { data: sceneData, error: sceneError } = await ctx.supabase.from("scenes").insert({
      version_id: version.id,
      idx: scene.idx,
      description: scene.scene_description,
      image_prompt: scene.scene_description,
      character_ids: charIds,
      image_status: "generating"
    }).select().single();

    if (sceneError) throw new Error("Failed to insert scene idx=" + scene.idx + ": " + sceneError.message);

    const { data: pageData, error: pageError } = await ctx.supabase.from("pages").insert({
      adaptation_id: adaptation.id,
      scene_id: sceneData.id,
      idx: scene.idx,
      text: scene.text
    }).select().single();

    if (pageError) throw new Error("Failed to insert page idx=" + scene.idx + ": " + pageError.message);

        if (scope === 'all' || scope === 'audio_only') {
      const { error: jobErr } = await ctx.supabase.from("jobs").insert([{
        kind: "audio",
        ref_type: "page",
        ref_id: pageData.id,
        process_run_id: job.process_run_id,
        status: "queued",
        attempts: 0,
        cost_usd: 0,
        run_after: new Date().toISOString(),
        idempotency_key: `audio_${job.process_run_id || ""}_${pageData.id}`
      }]);
      if (jobErr) throw new Error("Failed to queue jobs for scene " + scene.idx + ": " + jobErr.message);
    }

    console.log("Scene + page + jobs queued for idx=" + scene.idx);
  }

  if (scope === 'all' || scope === 'image_only') {
    const { error: bibleJobErr } = await ctx.supabase.from("jobs").insert({
      kind: "story-visual-bible",
      ref_type: "version",
      ref_id: version.id,
      process_run_id: job.process_run_id,
      status: "queued",
      attempts: 0,
      cost_usd: 0,
      run_after: new Date().toISOString(),
      idempotency_key: `bible_${job.process_run_id || ""}_${version.id}`
    });
    if (bibleJobErr) throw new Error("Failed to queue story-visual-bible: " + bibleJobErr.message);
  }

  // Update story version status
  await ctx.supabase.from("story_versions").update({
    asset_status: "generating",
    status: "published"
  }).eq("id", version.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  console.log("Segment complete for", version.story.title);
};

