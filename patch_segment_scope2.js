const fs = require("fs");
let segment = fs.readFileSync("apps/worker/src/stages/segment/index.ts", "utf-8");

const target = `    // Queue scene-image and audio jobs
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

    if (jobErr) throw new Error("Failed to queue jobs for scene " + scene.idx + ": " + jobErr.message);`;

const replacement = `    if (scope === 'all' || scope === 'audio_only') {
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
      if (jobErr) throw new Error("Failed to queue jobs for scene " + scene.idx + ": " + jobErr.message);
    }`;

if (segment.includes(target)) {
  segment = segment.replace(target, replacement);
  fs.writeFileSync("apps/worker/src/stages/segment/index.ts", segment, "utf-8");
  console.log("Patched successfully");
} else {
  console.log("Target string not found, trying regex...");
  // Fallback if formatting differs slightly
  segment = segment.replace(/\/\/ Queue scene-image and audio jobs[\s\S]*?if \(jobErr\) throw new Error\([^)]+\);/, replacement);
  fs.writeFileSync("apps/worker/src/stages/segment/index.ts", segment, "utf-8");
  console.log("Patched via regex");
}
