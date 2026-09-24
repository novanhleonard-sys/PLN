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
    pages: z.array(z.object({
      page_number: z.number(),
      text: z.string(),
      scene_description: z.string()
    }))
  });

  const prompt = "Bagi cerita berikut menjadi 6-14 halaman.\nCerita:\n" + version.content;

  console.log("Calling Gemini for segment...", version.story.title);
  const result = await registry.generateJSON(schema, {
    provider: "gemini",
    model: "gemini-3.6-flash",
    prompt,
    systemInstruction: "Anda adalah pembuat naskah buku anak. Bagi cerita ke halaman dengan panjang merata. Hasilkan juga sinopsis, tema, sensitivitas, tokoh, dan deskripsi visual yang detail untuk tiap halaman.",
    ref: version.id,
    stage: "segment"
  });
  
  // Insert characters
  for (const char of result.characters) {
    const { data: charData } = await ctx.supabase.from("characters").upsert({
      name: char.name,
      description: char.description,
      is_global: false
    }, { onConflict: 'name' }).select().single();
    
    if (charData) {
      // Spawn character stage for sheet generation
      await ctx.supabase.from("jobs").insert({
        kind: "character",
        ref_type: "character",
        ref_id: charData.id,
        status: "queued",
        attempts: 0,
        cost_usd: 0,
        run_after: new Date().toISOString(),
        idempotency_key: "character_" + charData.id
      });
    }
  }

  // Update story version
  await ctx.supabase.from("story_versions").update({
    asset_status: 'generating',
    status: 'published' // segment selesai, published
  }).eq("id", version.id);

  // Insert pages and queue scene-image and audio
  for (const page of result.pages) {
    const { data: pageData } = await ctx.supabase.from("pages").insert({
      story_id: version.story_id,
      page_number: page.page_number,
      content: page.text,
      visual_prompt: page.scene_description,
      image_status: 'pending',
      audio_status: 'pending'
    }).select().single();

    if (pageData) {
      await ctx.supabase.from("jobs").insert([{
        kind: "scene-image",
        ref_type: "page",
        ref_id: pageData.id,
        status: "queued",
        attempts: 0,
        cost_usd: 0,
        run_after: new Date().toISOString(),
        idempotency_key: "scene-image_" + pageData.id
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
    }
  }

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};



