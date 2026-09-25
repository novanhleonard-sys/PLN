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
    model: "gemini-3.6-flash",
    prompt,
    systemInstruction: "Anda adalah pembuat naskah buku anak. Bagi cerita ke bagian-bagian dengan panjang merata. Hasilkan deskripsi visual yang detail untuk tiap bagian agar bisa digambar oleh AI.",
    ref: version.id,
    stage: "segment"
  });

  console.log("Segment OK: scenes=" + result.scenes.length + " chars=" + result.characters.length);

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

    // Queue scene-image and audio jobs
    const { error: jobErr } = await ctx.supabase.from("jobs").insert([{
      kind: "scene-image",
      ref_type: "scene",
      ref_id: sceneData.id,
      status: "queued",
      attempts: 0,
      cost_usd: 0,
      run_after: new Date().toISOString(),
      idempotency_key: "scene-image_" + sceneData.id
    }, {
      kind: "audio",
      ref_type: "page",
      ref_id: pageData.id,
      status: "queued",
      attempts: 0,
      cost_usd: 0,
      run_after: new Date().toISOString(),
      idempotency_key: "audio_" + pageData.id
    }]);

    if (jobErr) throw new Error("Failed to queue jobs for scene " + scene.idx + ": " + jobErr.message);

    console.log("Scene + page + jobs queued for idx=" + scene.idx);
  }

  // Update story version status
  await ctx.supabase.from("story_versions").update({
    asset_status: "generating",
    status: "published"
  }).eq("id", version.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  console.log("Segment complete for", version.story.title);
};
