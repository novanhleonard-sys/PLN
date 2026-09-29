import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function TabRiwayat() {
  const { data: runs, isLoading } = useQuery({
    queryKey: ['admin_ai_process_runs', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_process_runs')
        .select('*, story_versions(stories(title)), jobs(id, status, cost_usd)')
        .in('status', ['completed', 'failed'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="p-8 font-nunito animate-pulse text-stone-500">Memuat riwayat...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito pb-12">
      {runs?.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Belum ada riwayat proses AI.
        </div>
      ) : (
        <div className="grid gap-4">
          {runs?.map((run) => (
            <div key={run.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all">
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{(run.story_versions?.stories?.title) || 'Tanpa Judul'} ({run.id.split('-')[0]})</h3>
                <div className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Status: <strong className={run.status === 'failed' ? 'text-red-500 uppercase' : 'text-teal uppercase'}>{run.status}</strong></span>
                  <span>Total Biaya: Rp {run.total_cost?.toLocaleString('id-ID') || (run.jobs?.reduce((acc: any, j: any) => acc + (j.cost_usd || 0), 0) * 15000).toLocaleString('id-ID')}</span>
                  <span>Total Percobaan: {run.attempts || run.total_attempts || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
