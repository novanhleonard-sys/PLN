import sharp from 'sharp';

export function assembleImagePrompt(
  styleDescriptor: string,
  sceneDescription: string,
  characterDescriptors: string[],
  fixedRules: string = "komposisi persegi, subjek di tengah dengan margin aman, tanpa teks, huruf, atau watermark"
): string {
  const chars = characterDescriptors && characterDescriptors.length > 0 
    ? `Tokoh: ${characterDescriptors.join(', ')}.` 
    : '';
  
  return `${styleDescriptor} Adegan: ${sceneDescription} ${chars} Aturan: ${fixedRules}`.trim().replace(/\s+/g, ' ');
}

export const processSceneImageStage = async (ctx: any, job: any) => {
  const { data: page } = await ctx.supabase.from("pages").select("*, story:stories(*)").eq("id", job.ref_id).single();
  if (!page) throw new Error("Page not found");

  console.log("Mocking scene-image for", page.story.title, "page", page.page_number);

  // Wajib merakit prompt deterministik dari style_configs + deskripsi adegan + tokoh
  const prompt = assembleImagePrompt(
    "ilustrasi buku anak dengan garis pensil warna halus, sapuan cat air lembut, dan tekstur kertas ringan",
    page.visual_prompt || "Adegan buku cerita",
    []
  );

  // Mock call ke API Gemini Image
  const mockImageBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 }
    }
  }).webp().toBuffer();

  const image1024 = await sharp(mockImageBuffer)
    .resize(1024, 1024, { fit: 'inside' })
    .webp({ quality: 80 })
    .toBuffer();

  // Upload ke storage (mocking by just marking as done)
  await ctx.supabase.from("pages").update({ image_status: 'ready' }).eq("id", page.id);
  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};
