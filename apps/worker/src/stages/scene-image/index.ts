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
    
  if (cRefs && cRefs.some((r: any) => r.status !== 'ready')) {
    throw new Error("WAITING_FOR_CANONICAL_REFS");
  }

  // Find relevant visual plan
  const plans = bible.scene_plans || [];
  const plan = plans.find((p: any) => p.scene_idx === scene.idx) || {};

  // Fetch canonical images based on plan
  const referenceBase64s: string[] = [];
  
  if (cRefs && plan.characters) {
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
            referenceBase64s.push(Buffer.from(arrBuffer).toString('base64'));
          }
        } catch (e) {
          console.error("Failed to fetch canonical ref image", ref.name);
        }
      }
    }
  }

  const renderingStyle = JSON.stringify(bible.rendering_style || {});
  const scenePlanJson = JSON.stringify(plan);
  
  const prompt = `
Rendering Style: ${renderingStyle}
Scene Visual Plan: ${scenePlanJson}
Deskripsi Scene Aktual: ${scene.description}

Aturan: Patuhi Rendering Style dan Scene Visual Plan. Gunakan referensi karakter/lokasi/prop yang diberikan (bila ada) sebagai panduan utama desain visual agar konsisten.`;

  console.log("Generating scene-image for", (scene.version?.story as any)?.title, "idx", scene.idx);

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
  fs.writeFileSync(tempFile, Buffer.from(resultBase64, 'base64'));

  const storagePath = `scenes/${scene.version_id}/${scene.id}_${Date.now()}.png`;
  const fileBuffer = fs.readFileSync(tempFile);

  const { error: uploadError } = await ctx.supabase.storage
    .from("assets")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      upsert: true
    });

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  const { data: publicUrlData } = ctx.supabase.storage.from("assets").getPublicUrl(storagePath);
  
  await ctx.supabase.from("scenes").update({
    image_path: publicUrlData.publicUrl,
    image_status: "ready"
  }).eq("id", scene.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  console.log("Scene image completed:", scene.idx);
};

