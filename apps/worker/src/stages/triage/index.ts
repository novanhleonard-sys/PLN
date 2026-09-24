import { z } from "zod";
import { ProviderRegistry } from "../../providers/registry";

export const triageStage = async (ctx: any, job: any, registry: ProviderRegistry) => {
  const { data: submission } = await ctx.supabase.from("submissions").select("*").eq("id", job.ref_id).single();
  if (!submission) throw new Error("Submission not found");

  const schema = z.object({
    status: z.enum(["accepted", "rejected", "diterima", "ditolak", "valid", "invalid", "true", "false"]),
    alasan: z.string().optional(),
    reason: z.string().optional()
  });

  const prompt = "Triage cerita ini:\nJudul: " + submission.title + "\nTipe: " + submission.type + "\nCerita: " + submission.body + "\nTentukan apakah ini cerita rakyat Indonesia yang valid.";

  console.log("Calling Zai for triage...", submission.title);
  const result = await registry.generateJSON(schema, {
    provider: "zai",
    model: "glm-5.3-flash",
    prompt,
    systemInstruction: "Anda adalah asisten kurator Peta Legenda Nusantara. Tolak cerita modern atau non-Indonesia. Return JSON matching the schema EXACTLY with properties `status` and `reason`.",
    ref: submission.id,
    stage: "triage"
  });
  
  const statusStr = String(result.status);
  const isAccepted = statusStr === "accepted" || statusStr === "diterima" || statusStr === "valid" || statusStr === "true";
  const reasonText = result.alasan || result.reason || "";
  console.log("Triage Result:", result.status, reasonText);
  
  if (isAccepted) {
    await ctx.supabase.from("jobs").insert({
      kind: "verify",
      ref_type: "submission",
      ref_id: submission.id,
      status: "queued",
      attempts: 0,
      cost_usd: 0,
      run_after: new Date().toISOString(),
      idempotency_key: "verify_" + submission.id
    });
  }

  await ctx.supabase.from("jobs").update({ status: "succeeded", error: reasonText }).eq("id", job.id);
};

