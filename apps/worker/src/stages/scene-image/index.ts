import { SupabaseClient } from "@supabase/supabase-js";
import { ProviderRegistry } from "../../providers/registry";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as crypto from "crypto";

export const processSceneImageStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
  const sceneId = job.ref_id;

  const { data: scene } = await ctx.supabase
    .from("scenes")
    .select("*, version:story_versions(id, story:stories(title, region_id))")
    .eq("id", sceneId)
    .single();

  if (!scene) throw new Error("Scene not found");

  const versionId = scene.version_id;

  const { data: bible } = await ctx.supabase
    .from("story_visual_bibles")
    .select("*")
    .eq("version_id", versionId)
    .single();

  if (!bible) {
    throw new Error("Story Visual Bible not ready yet for version " + versionId);
  }

  const { data: cRefs } = await ctx.supabase
    .from("canonical_references")
    .select("*")
    .eq("bible_id", bible.id);

  if (cRefs && cRefs.some((r: any) => r.is_canonical && r.master_sheet_id && r.status !== "ready")) {
    throw new Error("WAITING_FOR_CANONICAL_REFS");
  }

  // Find visual plan for this exact scene idx
  const plans = bible.scene_plans || [];
  const plan = plans.find((p: any) => p.scene_idx === scene.idx) || {};

  // Fetch canonical reference images for relevant entities in this scene
  const referenceBase64s: string[] = [];

  if (cRefs && (plan.characters?.length > 0 || plan.locations?.length > 0 || plan.props?.length > 0)) {
    const relevantRefs = cRefs.filter((r: any) =>
      (plan.characters || []).includes(r.name) ||
      (plan.locations || []).includes(r.name) ||
      (plan.props || []).includes(r.name)
    );

    for (const ref of relevantRefs) {
      if (ref.image_path) {
        try {
          const resp = await fetch(ref.image_path);
          if (resp.ok) {
            const arrBuffer = await resp.arrayBuffer();
            referenceBase64s.push(Buffer.from(arrBuffer).toString("base64"));
          }
        } catch (e: any) {
          throw new Error(`Failed to fetch canonical ref image ${ref.name}: ${e.message}`, { cause: e });
        }
      }
    }
  }

  const renderingStyle = JSON.stringify(bible.rendering_style || {});
  const overallDir = bible.overall_direction || "";
  const scenePlanJson = JSON.stringify(plan);

  const locDesc = (bible.locations || [])
    .filter((l: any) => (plan.locations || []).includes(l.name))
    .map((l: any) => l.name + ": " + l.description).join("\n");

  const propDesc = (bible.props || [])
    .filter((p: any) => (plan.props || []).includes(p.name))
    .map((p: any) => p.name + ": " + p.description).join("\n");

  // Admin can override prompt via job.custom_prompt
  const prompt = job.custom_prompt || `
Overall Direction: ${overallDir}
Rendering Style: ${renderingStyle}
Scene Visual Plan: ${scenePlanJson}
Deskripsi Lokasi: ${locDesc}
Deskripsi Properti: ${propDesc}
Deskripsi Scene Aktual: ${scene.description}

Aturan: Patuhi Rendering Style dan Overall Direction. Gunakan referensi karakter/lokasi/prop gambar yang diberikan (bila ada) sebagai panduan utama. Deskripsi teks di atas digunakan untuk hal-hal yang tidak memiliki referensi gambar spesifik agar tetap konsisten.`;

  console.log("Generating scene-image for", (scene.version?.story as any)?.title, "idx", scene.idx, job.custom_prompt ? "[CUSTOM PROMPT]" : "");

  const resultBase64 = await registry.generateImage({
    provider: "gemini",
    model: "gemini-3.1-flash-image",
    prompt,
    referenceImages: referenceBase64s,
    ref: job.id,
    stage: "scene-image"
  });

  if (!resultBase64) throw new Error("Failed to generate scene image");

  const tempFile = path.join(os.tmpdir(), `scene_${crypto.randomUUID()}.png`);
  fs.writeFileSync(tempFile, Buffer.from(resultBase64, "base64"));

  const storagePath = `scenes/${scene.version_id}/${scene.id}_${Date.now()}.png`;
  const fileBuffer = fs.readFileSync(tempFile);

  const { error: uploadError } = await ctx.supabase.storage
    .from("assets")
    .upload(storagePath, fileBuffer, { contentType: "image/png", upsert: true });

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  const { data: publicUrlData } = ctx.supabase.storage.from("assets").getPublicUrl(storagePath);

  await ctx.supabase.from("scenes").update({
    image_path: publicUrlData.publicUrl,
    image_status: "ready",
    image_prompt: prompt
  }).eq("id", scene.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  try { fs.unlinkSync(tempFile); } catch (e: any) { console.warn('Failed to delete temp file:', e.message); }
  console.log("Scene image completed:", scene.idx);
};
