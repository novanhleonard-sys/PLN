import { SupabaseClient } from "@supabase/supabase-js";
import { ProviderRegistry } from "../../providers/registry";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as crypto from "crypto";

export const processCanonicalRefStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
  const refId = job.ref_id;

  const { data: cRef } = await ctx.supabase
    .from("canonical_references")
    .select("*, bible:story_visual_bibles(rendering_style, overall_direction)")
    .eq("id", refId)
    .single();

  if (!cRef) throw new Error("Canonical reference not found");

  const renderingStyle = JSON.stringify(cRef.bible?.rendering_style || {});
  
  const prompt = `Buat gambar referensi desain kanonikal untuk sebuah ${cRef.type}.
Nama: ${cRef.name}
Deskripsi: ${cRef.description}

Rendering Style yang harus dipatuhi: ${renderingStyle}

Aturan penting:
- Gunakan background polos atau sangat sederhana.
- Prioritaskan kejelasan desain ${cRef.type} agar bisa digunakan sebagai referensi.`;

  console.log("Generating canonical ref:", cRef.name);

  // Generate Image
  const result = await registry.generateImage({
    provider: "gemini",
    model: "gemini-3.1-flash-image",
    prompt: prompt,
    ref: job.id,
    stage: "canonical-ref"
  });

  if (!result) throw new Error("No image generated");

  const tempFile = path.join(os.tmpdir(), `cref_${crypto.randomUUID()}.png`);
  fs.writeFileSync(tempFile, Buffer.from(result, 'base64')); // generateImage returns string base64

  const storagePath = `canonical/${cRef.bible_id}/${cRef.id}.png`;
  const fileBuffer = fs.readFileSync(tempFile);

  const { error: uploadError } = await ctx.supabase.storage
    .from("assets")
    .upload(storagePath, fileBuffer, {
      contentType: "image/png",
      upsert: true
    });

  if (uploadError) throw new Error("Upload failed: " + uploadError.message);

  const { data: publicUrlData } = ctx.supabase.storage.from("assets").getPublicUrl(storagePath);
  
  await ctx.supabase.from("canonical_references").update({
    image_path: publicUrlData.publicUrl,
    status: "ready"
  }).eq("id", cRef.id);

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
  try { fs.unlinkSync(tempFile); } catch (e) {}
  console.log("Canonical ref completed:", cRef.name);
};

