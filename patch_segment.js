const fs = require('fs');
let code = fs.readFileSync('apps/worker/src/stages/segment/index.ts', 'utf-8');

code = code.replace(
  /const \{ error: jobErr \} = await ctx\.supabase\.from\("jobs"\)\.insert\(\[([\s\S]*?)\]\);/,
  'const { error: jobErr } = await ctx.supabase.from("jobs").insert([{\n      kind: "audio",\n      ref_type: "page",\n      ref_id: pageData.id,\n      status: "queued",\n      attempts: 0,\n      cost_usd: 0,\n      run_after: new Date().toISOString(),\n      idempotency_key: "audio_" + pageData.id\n    }]);'
);

code = code.replace(
  '// Update story version status',
  'const { error: bibleJobErr } = await ctx.supabase.from("jobs").insert({\n    kind: "story-visual-bible",\n    ref_type: "version",\n    ref_id: version.id,\n    status: "queued",\n    attempts: 0,\n    cost_usd: 0,\n    run_after: new Date().toISOString(),\n    idempotency_key: "bible_" + version.id\n  });\n  if (bibleJobErr) throw new Error("Failed to queue story-visual-bible: " + bibleJobErr.message);\n\n  // Update story version status'
);

fs.writeFileSync('apps/worker/src/stages/segment/index.ts', code);
