import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const processStoryVisualBibleStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
  const versionId = job.ref_id;

  const { data: version } = await ctx.supabase
    .from("story_versions")
    .select("id, body, story:stories(title, region_id), scenes(id, idx, description)")
    .eq("id", versionId)
    .single();

  if (!version) throw new Error("Story version not found");

  const { data: umumG } = await ctx.supabase.from("app_settings").select("value").eq("key", "umum_gambar").single();
  const globalPrompt = umumG?.value?.prompt || "Gaya ilustrasi storybook kartunis...";

  const bibleSchema = z.object({
    overall_direction: z.any(),
    rendering_style: z.any(),
    color_palette: z.any(),
    characters: z.array(z.object({
      name: z.string(),
      description: z.string(),
      role: z.string().optional()
    })),
    locations: z.array(z.object({
      name: z.string(),
      description: z.string()
    })),
    props: z.array(z.object({
      name: z.string(),
      description: z.string()
    })),
    scene_plans: z.array(z.object({
      scene_idx: z.number(),
      narrative_focus: z.string(),
      characters: z.array(z.string()),
      locations: z.array(z.string()),
      props: z.array(z.string()),
      density: z.string()
    }))
  });

  const sysPrompt = `Anda adalah Art Director untuk Peta Legenda Nusantara. Buat Story Visual Bible untuk cerita berjudul: "${(version.story as any)?.title}".
Patuhi Global Image Instruction berikut:
${globalPrompt}

Hasilkan JSON dengan skema:
- overall_direction: atmosfer, mood
- rendering_style: medium, lines, shading
- color_palette: warna dominan, secondary, dll
- characters: daftar karakter penting (dengan deskripsi fisik lengkap)
- locations: daftar lokasi penting
- props: benda penting
- scene_plans: rencana visual per scene (scene_idx harus sesuai urutan scene)

Teks Cerita:
${version.body}
`;

  console.log("Generating Story Visual Bible for version", versionId);
  const bibleData = await registry.generateJSON(bibleSchema, {
    provider: "gemini",
    model: "gemini-3.8-flash",
    prompt: sysPrompt,
    ref: job.id,
    stage: "story-visual-bible"
  });

  const { data: bibleRecord, error: bibleErr } = await ctx.supabase.from("story_visual_bibles").insert({
    version_id: versionId,
    overall_direction: bibleData.overall_direction,
    rendering_style: bibleData.rendering_style,
    color_palette: bibleData.color_palette,
    characters: bibleData.characters,
    locations: bibleData.locations,
    props: bibleData.props,
    scene_plans: bibleData.scene_plans
  }).select("id").single();

  if (bibleErr) throw new Error("Failed to insert bible: " + bibleErr.message);

  const canonicalJobs: any[] = [];
  
  const insertRefs = async (items: any[], type: string) => {
    for (const item of items) {
      const { data: refRecord } = await ctx.supabase.from("canonical_references").insert({
        bible_id: bibleRecord.id,
        type: type,
        name: item.name,
        description: item.description || item.role || ""
      }).select("id").single();

      if (refRecord) {
        canonicalJobs.push({
          kind: "canonical-ref",
          ref_type: "canonical_reference",
          ref_id: refRecord.id,
          status: "queued",
          attempts: 0,
          cost_usd: 0,
          run_after: new Date().toISOString(),
          idempotency_key: `canonical_ref_${refRecord.id}`
        });
      }
    }
  };

  await insertRefs(bibleData.characters || [], "character");
  await insertRefs(bibleData.locations || [], "location");
  await insertRefs(bibleData.props || [], "prop");

  if (canonicalJobs.length > 0) {
    const { error: cjobErr } = await ctx.supabase.from("jobs").insert(canonicalJobs);
    if (cjobErr) throw new Error("Failed to queue canonical jobs: " + cjobErr.message);
  }

  const sceneJobs = version.scenes.map((s: any) => ({
    kind: "scene-image",
    ref_type: "scene",
    ref_id: s.id,
    status: "queued",
    attempts: 0,
    cost_usd: 0,
    run_after: new Date().toISOString(),
    idempotency_key: `scene_image_stage2_${s.id}`
  }));

  if (sceneJobs.length > 0) {
    const { error: sjobErr } = await ctx.supabase.from("jobs").insert(sceneJobs);
    if (sjobErr) throw new Error("Failed to queue scene-image jobs: " + sjobErr.message);
  }

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  console.log("Story Visual Bible generated & jobs queued.");
};



