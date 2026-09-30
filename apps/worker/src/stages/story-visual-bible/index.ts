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

  const scenes: any[] = (version.scenes || []).sort((a: any, b: any) => a.idx - b.idx);
  if (scenes.length === 0) throw new Error("No scenes found for version " + versionId);

  const { data: umumG } = await ctx.supabase.from("app_settings").select("value").eq("key", "umum_gambar").single();
  const globalPrompt = umumG?.value?.prompt || "Gaya ilustrasi storybook kartunis...";

  const bibleSchema = z.object({
    overall_direction: z.any(),
    rendering_style: z.any(),
    color_palette: z.any(),
    characters: z.array(z.object({
      name: z.string(),
      description: z.string(),
      role: z.string().optional(),
      is_canonical: z.boolean().default(false)
    })),
    locations: z.array(z.object({
      name: z.string(),
      description: z.string(),
      is_canonical: z.boolean().default(false)
    })),
    props: z.array(z.object({
      name: z.string(),
      description: z.string(),
      is_canonical: z.boolean().default(false)
    }))
  });

  // Scene plans are derived from actual DB scenes — NOT from AI free-form generation
  // This prevents scene_idx mismatch between bible.scene_plans and actual scenes
  const scenePlanSchema = z.object({
    plans: z.array(z.object({
      scene_idx: z.number(),
      narrative_focus: z.string(),
      characters: z.array(z.string()),
      locations: z.array(z.string()),
      props: z.array(z.string()),
      density: z.enum(["sparse", "moderate", "dense"])
    }))
  });

  const sceneListForPrompt = scenes.map((s: any) =>
    `Scene ${s.idx}: ${s.description}`
  ).join("\n\n");

  const sysPrompt = `Anda adalah Art Director untuk Peta Legenda Nusantara. Buat Story Visual Bible untuk cerita berjudul: "${(version.story as any)?.title}".
Patuhi Global Image Instruction berikut:
${globalPrompt}

Hasilkan JSON dengan skema:
- characters, locations, props: tetapkan is_canonical=true hanya untuk entitas penting (berulang/signifikan secara visual).

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

  // Generate scene plans separately, explicitly listing each scene idx from DB
  console.log("Generating scene plans for", scenes.length, "scenes");
  const planData = await registry.generateJSON(scenePlanSchema, {
    provider: "gemini",
    model: "gemini-3.8-flash",
    prompt: `Anda adalah Art Director. Untuk setiap scene berikut, tentukan characters, locations, props yang muncul, dan narrative_focus visual.
PENTING: Kembalikan tepat ${scenes.length} plans, satu untuk setiap scene_idx di bawah. Jangan tambah atau kurangi.

Karakter yang tersedia: ${bibleData.characters.map((c: any) => c.name).join(", ")}
Lokasi yang tersedia: ${bibleData.locations.map((l: any) => l.name).join(", ")}
Props yang tersedia: ${bibleData.props.map((p: any) => p.name).join(", ")}

Daftar Scene:
${sceneListForPrompt}`,
    ref: job.id,
    stage: "story-visual-bible"
  });

  // Validate plans cover all scene indices
  const sceneIdxSet = new Set(scenes.map((s: any) => s.idx));
  const planIdxSet = new Set(planData.plans.map((p: any) => p.scene_idx));
  for (const idx of sceneIdxSet) {
    if (!planIdxSet.has(idx)) {
      // Fill missing plan with minimal fallback
      planData.plans.push({
        scene_idx: idx,
        narrative_focus: scenes.find((s: any) => s.idx === idx)?.description || "",
        characters: [],
        locations: [],
        props: [],
        density: "moderate"
      });
    }
  }

  // Idempotency: Delete existing visual bible for this version
  const { error: delErr } = await ctx.supabase.from("story_visual_bibles").delete().eq("version_id", versionId);
  if (delErr) throw new Error("Failed to clean up old bible: " + delErr.message);

  const { data: bibleRecord, error: bibleErr } = await ctx.supabase.from("story_visual_bibles").insert({
    version_id: versionId,
    overall_direction: bibleData.overall_direction,
    rendering_style: bibleData.rendering_style,
    color_palette: bibleData.color_palette,
    characters: bibleData.characters,
    locations: bibleData.locations,
    props: bibleData.props,
    scene_plans: planData.plans
  }).select("id").single();

  if (bibleErr) throw new Error("Failed to insert bible: " + bibleErr.message);

  const allEntities: any[] = [];
  const insertRefs = async (items: any[], type: string) => {
    for (const item of items) {
      const { data: refRecord } = await ctx.supabase.from("canonical_references").insert({
        bible_id: bibleRecord.id,
        type: type,
        name: item.name,
        description: item.description || item.role || "",
        is_canonical: item.is_canonical || false
      }).select("id, is_canonical, name").single();

      if (refRecord && refRecord.is_canonical) {
        allEntities.push(refRecord);
      }
    }
  };

  await insertRefs(bibleData.characters || [], "character");
  await insertRefs(bibleData.locations || [], "location");
  await insertRefs(bibleData.props || [], "prop");

  if (allEntities.length > 0) {
    const plannerSchema = z.object({
      master_sheets: z.array(z.object({
        rows: z.number().max(3),
        columns: z.number().max(3),
        entities: z.array(z.object({
          id: z.string(),
          row: z.number(),
          column: z.number()
        }))
      }))
    });

    const entitiesListStr = allEntities.map(e => `- ${e.name} (id: ${e.id})`).join("\n");
    const plannerPrompt = `Plan canonical master sheets for these entities:\n${entitiesListStr}\n\nRules:\n- preferredMaxEntitiesPerSheet = 6, absoluteMaxEntitiesPerSheet = 9\n- Return array of master_sheets with rows and columns (e.g., 2x3, 1x3, 2x2).\n- Assign each entity to a specific row and column in one of the sheets (0-indexed).\n- Group semantically (e.g. main characters together).`;

    const sheetPlanData = await registry.generateJSON(plannerSchema, {
      provider: "gemini",
      model: "gemini-3.8-flash",
      prompt: plannerPrompt,
      ref: job.id,
      stage: "story-visual-bible"
    });

    const masterJobs: any[] = [];
    for (const sheetPlan of sheetPlanData.master_sheets) {
      if (sheetPlan.entities.length === 0) continue;

      const { data: sheetRec } = await ctx.supabase.from("canonical_master_sheets").insert({
        bible_id: bibleRecord.id,
        sheet_rows: sheetPlan.rows,
        sheet_columns: sheetPlan.columns,
        entity_count: sheetPlan.entities.length,
        layout_metadata: sheetPlan
      }).select("id").single();

      if (sheetRec) {
        masterJobs.push({
          process_run_id: job.process_run_id,
          kind: "canonical-master",
          ref_type: "canonical_master_sheet",
          ref_id: sheetRec.id,
          status: "queued",
          attempts: 0,
          cost_usd: 0,
          run_after: new Date().toISOString(),
          idempotency_key: `canonical_master_${sheetRec.id}`
        });

        for (const e of sheetPlan.entities) {
          await ctx.supabase.from("canonical_references").update({
            master_sheet_id: sheetRec.id,
            sheet_row: e.row,
            sheet_column: e.column
          }).eq("id", e.id);
        }
      }
    }

    if (masterJobs.length > 0) {
      await ctx.supabase.from("jobs").insert(masterJobs);
    }
  }

  const sceneJobs = scenes.map((s: any) => ({
    process_run_id: job.process_run_id,
    kind: "scene-image",
    ref_type: "scene",
    ref_id: s.id,
    status: "queued",
    attempts: 0,
    cost_usd: 0,
    run_after: new Date().toISOString(),
    idempotency_key: `scene_image_stage2_${job.process_run_id}_${s.id}`
  }));

  if (sceneJobs.length > 0) {
    const { error: err } = await ctx.supabase.from("jobs").insert(sceneJobs);
    if (err) throw err;
  }

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  console.log("Story Visual Bible generated & jobs queued for", scenes.length, "scenes.");
};
