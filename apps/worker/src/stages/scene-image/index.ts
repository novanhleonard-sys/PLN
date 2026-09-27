import sharp from 'sharp';
import { ProviderRegistry } from "../../providers/registry";

export function assembleImagePrompt(
  styleDescriptor: string,
  sceneDescription: string,
  fixedRules: string = "composition square, subject in center with safe margin, no text, no letters, no watermark"
): string {
  return `${styleDescriptor} Adegan: ${sceneDescription} Aturan: ${fixedRules}`.trim().replace(/\\s+/g, ' ');
}

export const processSceneImageStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: scene } = await ctx.supabase.from("scenes")
    .select("*, version:story_versions(*, story:stories(*))")
    .eq("id", job.ref_id)
    .single();

  if (!scene) throw new Error("Scene not found");

  console.log("Processing scene-image for", scene.version.story.title, "scene idx", scene.idx);

  // Get region_group_id from stories regions
  let regionGroupId = null;
  const { data: regions } = await ctx.supabase.from("regions").select("region_group_id").eq("id", scene.version.story.region_id).limit(1).maybeSingle();
  if (regions) regionGroupId = regions.region_group_id;

  // Get style config
  let { data: styleConfig } = await ctx.supabase
    .from("style_configs")
    .select("*")
    .eq("story_type", scene.version.story.type)
    .eq("region_group_id", regionGroupId)
    .limit(1)
    .maybeSingle();

  if (!styleConfig) {
    const { data: fallback } = await ctx.supabase.from("style_configs").select("*").limit(1).maybeSingle();
    styleConfig = fallback;
  }

  const { data: umum } = await ctx.supabase.from("app_settings").select("value").eq("key", "umum_gambar").single();
  const basePrompt = umum?.value?.prompt || "";
  const specific = styleConfig?.descriptor || "ilustrasi buku anak dengan garis pensil warna halus, sapuan cat air lembut, dan tekstur kertas ringan";
  const descriptor = [basePrompt, specific].filter(Boolean).join("\n\nAturan Spesifik: ");

  const prompt = assembleImagePrompt(
    descriptor,
    scene.image_prompt || scene.description || "Adegan buku cerita",
  );

  const result = await registry.generateImage({
    provider: "gemini",
    model: "gemini-3.1-flash-image", 
    prompt,
    ref: scene.version.id,
    stage: "scene-image",
    userId: undefined
  });

  if (!result || !result.length) {
    throw new Error("Failed to generate image base64");
  }

  // Parse base64 and convert to WebP
  const imageBuffer = Buffer.from(result, 'base64');
  const webpBuffer = await sharp(imageBuffer)
    .resize(1024, 1024, { fit: 'inside' }) // ensure it's not too huge
    .webp({ quality: 80 })
    .toBuffer();
  
  const filePath = `scenes/${scene.version_id}/${scene.idx}.webp`;
  
  const { error: uploadError } = await ctx.supabase.storage
    .from("story-media")
    .upload(filePath, webpBuffer, {
      contentType: 'image/webp',
      upsert: true
    });

  if (uploadError) {
     throw new Error("Failed to upload image: " + uploadError.message);
  }

  // Get public URL
  const { data: publicUrlData } = ctx.supabase.storage
    .from("story-media")
    .getPublicUrl(filePath);

  // Update scene record
  await ctx.supabase.from("scenes").update({ 
    image_status: 'ready',
    image_path: publicUrlData.publicUrl
  }).eq("id", scene.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};


