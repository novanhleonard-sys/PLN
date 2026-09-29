import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Toast } from '../../../ui/basic/Toast';

export function TabPantauan() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // Fetch running/queued/partially_completed runs
  const { data: runs, isLoading } = useQuery({
    queryKey: ['admin_ai_process_runs', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_process_runs')
        .select('*, story_versions(stories(title)), jobs(id, status, cost_usd)')
        .in('status', ['queued', 'running', 'partially_completed'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch jobs for expanded run
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['admin_jobs', expandedRunId],
    enabled: !!expandedRunId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('process_run_id', expandedRunId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const regenerateMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'queued', attempts: 0, error: null })
        .eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Job berhasil diantrekan ulang.');
      queryClient.invalidateQueries({ queryKey: ['admin_jobs', expandedRunId] });
      queryClient.invalidateQueries({ queryKey: ['admin_ai_process_runs'] });
    }
  });

  if (isLoading) return <div className="p-8 font-nunito animate-pulse text-stone-500">Memuat pantauan...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito pb-12">
      {runs?.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Tidak ada proses AI yang sedang berjalan.
        </div>
      ) : (
        <div className="grid gap-4">
          {runs?.map((run) => (
            <div key={run.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col gap-4 transition-all">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="font-bold font-fredoka text-lg text-stone-800">{(run.story_versions?.stories?.title) || 'Tanpa Judul'} ({run.id.split('-')[0]})</h3>
                  <div className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Status: <strong className="uppercase">{run.status}</strong></span>
                    <span>Progres: {run.jobs?.filter((j: any) => j.status === 'succeeded').length || 0}/{run.jobs?.length || 0}</span>
                    <span>Biaya: Rp {(run.jobs?.reduce((acc: any, j: any) => acc + (j.cost_usd || 0), 0) * 15000).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <Button 
                  variant={expandedRunId === run.id ? 'secondary' : 'primary'}
                  onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                >
                  {expandedRunId === run.id ? 'Tutup Detail' : 'Lihat Jobs'}
                </Button>
              </div>
              
              {expandedRunId === run.id && (
                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                  {isLoadingJobs ? (
                    <div className="text-sm text-stone-500 p-4 bg-stone-50 rounded-xl animate-pulse">Memuat jobs...</div>
                  ) : jobs?.length === 0 ? (
                    <div className="text-sm text-stone-500 p-4 bg-stone-50 rounded-xl">Belum ada job.</div>
                  ) : (
                    jobs?.map((job: any) => (
                      <div key={job.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="font-bold text-stone-700 text-sm">{job.kind} — {job.ref_type}</div>
                            <div className="text-xs text-stone-500 flex gap-4 mt-1">
                              <span>Status: <strong className={job.status === 'failed' ? 'text-red-500 uppercase' : 'uppercase text-stone-700'}>{job.status}</strong></span>
                              <span>Percobaan: {job.attempts || 0}</span>
                            </div>
                          </div>
                          {job.status === 'failed' && (
                            <Button 
                              size="sm"
                              onClick={() => regenerateMutation.mutate(job.id)}
                              disabled={regenerateMutation.isPending}
                            >
                              {regenerateMutation.isPending ? 'Memproses...' : 'Regenerate Job'}
                            </Button>
                          )}
                        </div>
                        {(job.error || job.error_message) && (
                          <div className="mt-2 text-xs font-mono bg-white border border-red-100 text-red-600 p-3 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {job.error || job.error_message}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
