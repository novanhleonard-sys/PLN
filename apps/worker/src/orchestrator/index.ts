import { verifyLogic } from '../../../../packages/shared/src/verification';

export async function applyVerdict(job: any, ctx: any) {
  const verdict = verifyLogic(job.payload);
  await ctx.supabase?.from('jobs').update({ status: verdict ? 'approved' : 'rejected' }).eq('id', job.id);
  return verdict;
}