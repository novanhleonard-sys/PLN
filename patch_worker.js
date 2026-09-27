const fs = require('fs');
let code = fs.readFileSync('apps/worker/src/stages/scene-image/index.ts', 'utf-8');

code = code.replace(
  /const descriptor = styleConfig\?\.descriptor \|\| "ilustrasi buku anak dengan garis pensil warna halus, sapuan cat air lembut, dan tekstur kertas ringan";/,
  const { data: umum } = await ctx.supabase.from("app_settings").select("value").eq("key", "umum_gambar").single();
  const basePrompt = umum?.value?.prompt || "";
  const specific = styleConfig?.descriptor || "ilustrasi buku anak dengan garis pensil warna halus, sapuan cat air lembut, dan tekstur kertas ringan";
  const descriptor = [basePrompt, specific].filter(Boolean).join("\\n\\nAturan Spesifik: ");
);

fs.writeFileSync('apps/worker/src/stages/scene-image/index.ts', code);
