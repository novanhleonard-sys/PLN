import { SupabaseClient } from "@supabase/supabase-js";
import { ProviderRegistry } from "../../providers/registry";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as crypto from "crypto";
import sharp from "sharp";

export const processCanonicalMasterStage = async (ctx: { supabase: SupabaseClient }, job: any, registry: ProviderRegistry) => {
  const sheetId = job.ref_id;

  const { data: sheet } = await ctx.supabase
    .from("canonical_master_sheets")
    .select("*, bible:story_visual_bibles(version_id, overall_direction, rendering_style, color_palette, story_versions(story:stories(title)))")
    .eq("id", sheetId)
    .single();

  if (!sheet) throw new Error("Canonical master sheet not found");

  const { data: refs } = await ctx.supabase
    .from("canonical_references")
    .select("*")
    .eq("master_sheet_id", sheetId);

  if (!refs || refs.length === 0) throw new Error("No references found for this master sheet");

  const cols = sheet.sheet_columns;
  const rows = sheet.sheet_rows;

  let prompt = `Draw a ${cols} columns by ${rows} rows grid concept art sheet.\n`;
  prompt += `Maintain strict grid layout with neutral background. Do not add text, titles, or decorative frames. The grid cells must not overlap.\n\n`;
  
  if (sheet.bible.overall_direction) prompt += `Style direction: ${sheet.bible.overall_direction}\n`;
  if (sheet.bible.rendering_style) prompt += `Rendering: ${sheet.bible.rendering_style}\n`;
  if (sheet.bible.color_palette) prompt += `Colors: ${sheet.bible.color_palette}\n\n`;

  prompt += `GRID ASSIGNMENTS:\n`;

  for (const ref of refs) {
    prompt += `Row ${ref.sheet_row + 1}, Column ${ref.sheet_column + 1}: ${ref.name}. ${ref.description}\n`;
  }

  const totalCells = rows * cols;
  const emptyCells = totalCells - refs.length;
  if (emptyCells > 0) {
    prompt += `\nLeave the remaining ${emptyCells} cell(s) completely empty. Do not duplicate entities.`;
  }

  console.log(`Generating canonical-master for sheet ${sheetId} (${cols}x${rows})`);

  const resultBase64 = await registry.generateImage({
    provider: "gemini",
    model: "gemini-1.5-flash-lite-image",
    prompt,
    ref: job.id,
    stage: "canonical-master"
  });
  if (!resultBase64) throw new Error("No image generated");

  const tempDir = os.tmpdir();
  const masterFileName = `master_${sheetId}_${crypto.randomBytes(4).toString("hex")}.png`;
  const masterFilePath = path.join(tempDir, masterFileName);
  
  const imageBuffer = Buffer.from(resultBase64, 'base64');
  fs.writeFileSync(masterFilePath, imageBuffer);

  // Upload master sheet
  const masterStoragePath = `${sheet.bible.version_id}/masters/${masterFileName}`;
  const { error: uploadMasterErr } = await ctx.supabase.storage
    .from("assets")
    .upload(masterStoragePath, imageBuffer, { contentType: "image/png", upsert: true });

  if (uploadMasterErr) throw new Error("Upload master failed: " + uploadMasterErr.message);

  const { data: publicUrlMaster } = ctx.supabase.storage.from("assets").getPublicUrl(masterStoragePath);

  await ctx.supabase.from("canonical_master_sheets").update({
    image_path: publicUrlMaster.publicUrl
  }).eq("id", sheetId);

  // Crop using sharp
  const metadata = await sharp(imageBuffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Invalid image metadata");

  const cellWidth = Math.floor(metadata.width / cols);
  const cellHeight = Math.floor(metadata.height / rows);

  for (const ref of refs) {
    const left = ref.sheet_column * cellWidth;
    const top = ref.sheet_row * cellHeight;

    const croppedBuffer = await sharp(imageBuffer)
      .extract({ left, top, width: cellWidth, height: cellHeight })
      .toBuffer();

    const cropFileName = `crop_${ref.id}_${crypto.randomBytes(4).toString("hex")}.png`;
    const cropStoragePath = `${sheet.bible.version_id}/crops/${cropFileName}`;

    await ctx.supabase.storage
      .from("assets")
      .upload(cropStoragePath, croppedBuffer, { contentType: "image/png", upsert: true });

    const { data: publicUrlCrop } = ctx.supabase.storage.from("assets").getPublicUrl(cropStoragePath);

    await ctx.supabase.from("canonical_references").update({
      image_path: publicUrlCrop.publicUrl,
      crop_metadata: { left, top, width: cellWidth, height: cellHeight },
      status: "ready"
    }).eq("id", ref.id);
  }

  // Cleanup
  try { fs.unlinkSync(masterFilePath); } catch (e: any) { console.warn('Failed to delete temp file:', e.message); }
  
  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};
