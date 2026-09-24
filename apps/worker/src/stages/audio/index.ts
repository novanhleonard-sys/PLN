export const audioStage = async (ctx: any, job: any) => {
  const { data: page } = await ctx.supabase.from("pages").select("*, story:stories(*)").eq("id", job.ref_id).single();
  if (!page) throw new Error("Page not found");

  console.log("Mocking audio for", page.story.title, "page", page.page_number);

  await ctx.supabase.from("pages").update({ audio_status: 'ready' }).eq("id", page.id);
  await ctx.supabase.from("jobs").update({ status: "succeeded", error: null }).eq("id", job.id);
};
