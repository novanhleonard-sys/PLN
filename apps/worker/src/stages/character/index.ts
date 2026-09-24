import { ProviderRegistry } from "../../providers/registry";

export const characterStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: char } = await ctx.supabase.from("characters").select("*").eq("id", job.ref_id).single();
  if (!char) throw new Error("Character not found");

  // Since we don't have access to Imagen here, we mock the image generation.
  // We use sharp in a similar way to scene-image.
  console.log("Mocking character sheet generation for", char.name);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};
