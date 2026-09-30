const fs = require("fs");
let segment = fs.readFileSync("apps/worker/src/stages/segment/index.ts", "utf-8");

segment = segment.replace(
  /const \{ error: jobErr \} = await ctx\.supabase\.from\("jobs"\)\.insert\(\[\{\n\s*kind: "audio",\n\s*ref_type: "page",\n\s*ref_id: pageData\.id,\n\s*process_run_id: job\.process_run_id,\n\s*status: "queued",\n\s*attempts: 0,\n\s*cost_usd: 0,\n\s*run_after: new Date\(\)\.toISOString\(\),\n\s*idempotency_key: `audio_\$\{job\.process_run_id \|\| ""\}_\$\{pageData\.id\}`\n\s*\}\]\);\n\n\s*if \(jobErr\) throw new Error\("Failed to queue jobs for scene " \+ scene\.idx \+ ": " \+ jobErr\.message\);/g,
  `if (scope === 'all' || scope === 'audio_only') {
      const { error: jobErr } = await ctx.supabase.from("jobs").insert([{
        kind: "audio",
        ref_type: "page",
        ref_id: pageData.id,
        process_run_id: job.process_run_id,
        status: "queued",
        attempts: 0,
        cost_usd: 0,
        run_after: new Date().toISOString(),
        idempotency_key: \`audio_\${job.process_run_id || ""}_\${pageData.id}\`
      }]);
      if (jobErr) throw new Error("Failed to queue audio job for scene " + scene.idx + ": " + jobErr.message);
    }`
);

fs.writeFileSync("apps/worker/src/stages/segment/index.ts", segment, "utf-8");
