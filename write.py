import os

content = '''import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Toast } from '../../../ui/basic/Toast';
import { Modal } from '../../../ui/layers/Modal';
import { ChevronDown, ChevronRight, Edit2, RefreshCw, Eye } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  succeeded: "text-teal-600",
  failed: "text-red-600",
  queued: "text-stone-400",
  running: "text-blue-500",
  deferred: "text-orange-500",
  completed: "text-teal-600"
};

function CostBadge({ jobIds }: { jobIds: string[] }) {
  const { data } = useQuery({
    queryKey: ['admin_jobs_cost', jobIds],
    enabled: jobIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from('jobs').select('cost_usd').in('id', jobIds);
      if (error) throw error;
      return data.reduce((acc, row) => acc + (row.cost_usd || 0), 0);
    }
  });
  return <span className="font-semibold text-stone-600">Biaya: </span>;
}

function JobRow({ job, onRevise, onImageClick }: { job: any, onRevise: (j: any) => void, onImageClick: (url: string) => void }) {
  const [showUsage, setShowUsage] = useState(false);

  const { data: usageLogs } = useQuery({
    queryKey: ['admin_ai_usage', job.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('ai_usage').select('*').eq('job_id', job.id).order('created_at');
      if (error) throw error;
      return data;
    }
  });

  const { data: scene } = useQuery({
    queryKey: ['admin_scene', job.ref_id],
    enabled: job.kind === 'scene-image' && !!job.ref_id,
    queryFn: async () => {
      const { data, error } = await supabase.from('scenes').select('image_path, idx').eq('id', job.ref_id).single();
      if (error) return null;
      return data;
    }
  });

  return (
    <div className="flex flex-col border border-stone-200 rounded-xl overflow-hidden bg-white">
      <div className="p-4 flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-stone-700">{job.kind} {scene ? — Scene  : ''}</span>
            <span className={	ext-xs font-bold uppercase }>{job.status}</span>
            <span className="text-xs text-stone-400">×{job.attempts || 1}</span>
            <span className="text-xs font-semibold text-stone-600">\</span>
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setShowUsage(!showUsage)}
              className="text-xs text-teal-700 hover:underline flex items-center gap-1"
            >
              <Eye size={12} /> {showUsage ? 'Sembunyikan' : 'Lihat'} {usageLogs?.length || 0} Request Log
            </button>
          </div>

          {showUsage && usageLogs && usageLogs.length > 0 && (
            <div className="mt-3 text-[10px] sm:text-xs font-mono bg-stone-50 p-3 rounded-lg flex flex-col gap-1 border border-stone-200">
              <div className="grid grid-cols-12 font-bold text-stone-500 border-b border-stone-200 pb-1 mb-1">
                <div className="col-span-1">Att</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Model</div>
                <div className="col-span-2 text-right">In</div>
                <div className="col-span-2 text-right">Out</div>
                <div className="col-span-2 text-right">Cost ($)</div>
              </div>
              {usageLogs.map((log: any, i: number) => (
                <div key={log.id} className="grid grid-cols-12 items-start border-b border-stone-200/50 pb-1 last:border-0 last:pb-0 pt-1">
                  <div className="col-span-1">{log.attempt || i + 1}</div>
                  <div className={col-span-2 }>{log.operation_status || 'succeeded'}</div>
                  <div className="col-span-3 truncate" title={log.model}>{log.model}</div>
                  <div className="col-span-2 text-right">{log.units_in}</div>
                  <div className="col-span-2 text-right">{log.units_out}</div>
                  <div className="col-span-2 text-right font-semibold">\</div>
                  {log.error_message && (
                    <div className="col-span-12 text-red-500 mt-1 p-1 bg-red-50 border border-red-100 rounded truncate" title={log.error_message}>Err: {log.error_message}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {job.error && (
            <div className="mt-2 text-xs font-mono bg-white border border-red-100 text-red-600 p-2 rounded-lg max-h-28 overflow-y-auto whitespace-pre-wrap">
              {job.error}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 shrink-0">
          {job.kind === 'scene-image' && (
            <button
              onClick={() => onRevise(job)}
              className="flex items-center justify-center gap-1 text-xs text-teal-700 border border-teal-200 bg-teal-50 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition-colors font-medium"
            >
              <Edit2 size={12} /> Revisi
            </button>
          )}
        </div>
      </div>
      
      {job.kind === 'scene-image' && scene?.image_path && (
        <div 
          className="border-t border-stone-200 cursor-pointer overflow-hidden relative group bg-stone-100"
          onClick={() => onImageClick(scene.image_path!)}
        >
          <img
            src={scene.image_path}
            alt={Scene }
            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full drop-shadow-md backdrop-blur-sm transition-opacity">Perbesar</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TabRiwayat() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviseJob, setReviseJob] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const { data: runs, isLoading } = useQuery({
    queryKey: ['admin_ai_process_runs', 'history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_process_runs')
        .select('*, story_versions(stories(title))')
        .in('status', ['completed', 'failed'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: expandedJobs } = useQuery({
    queryKey: ['run_jobs', expanded],
    enabled: !!expanded,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('process_run_id', expanded!)
        .order('created_at');
      if (error) throw error;
      return data;
    }
  });

  const requeueMutation = useMutation({
    mutationFn: async ({ jobId, prompt }: { jobId: string; prompt: string }) => {
      const { error } = await supabase.from('jobs').update({
        status: 'queued',
        attempts: 0,
        error: null,
        custom_prompt: prompt || null,
        run_after: new Date().toISOString()
      }).eq('id', jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Job berhasil diantrekan ulang.');
      setReviseJob(null);
      queryClient.invalidateQueries({ queryKey: ['run_jobs', expanded] });
    }
  });

  const openRevise = (job: any) => {
    setReviseJob(job);
    setCustomPrompt(job.custom_prompt || '');
  };

  if (isLoading) return <div className="p-8 font-nunito animate-pulse text-stone-500">Memuat riwayat...</div>;

  return (
    <div className="flex flex-col gap-4 font-nunito pb-12">
      {!runs?.length ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Belum ada riwayat proses AI.
        </div>
      ) : runs.map((run) => {
        const isOpen = expanded === run.id;
        const title = (run.story_versions?.stories?.title) || 'Tanpa Judul';
        const totalAttempts = (expandedJobs && isOpen) ? expandedJobs.reduce((acc: number, j: any) => acc + (j.attempts || 0), 0) : null;

        return (
          <div key={run.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            <button
              onClick={() => setExpanded(isOpen ? null : run.id)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-2">
                  <span className={ont-bold uppercase }>{run.status}</span>
                  <CostBadge jobIds={expandedJobs && isOpen ? expandedJobs.map((j: any) => j.id) : []} />
                  {totalAttempts !== null && <span>Total Percobaan: {totalAttempts}</span>}
                  <span className="text-stone-400">{new Date(run.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="bg-stone-100 p-2 rounded-full shrink-0">
                {isOpen ? <ChevronDown size={20} className="text-stone-500" /> : <ChevronRight size={20} className="text-stone-500" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-stone-100 p-5 bg-stone-50 flex flex-col gap-4">
                {!expandedJobs ? (
                  <div className="text-sm text-stone-500 animate-pulse">Memuat jobs...</div>
                ) : expandedJobs.length === 0 ? (
                  <div className="text-sm text-stone-500">Tidak ada job.</div>
                ) : (
                  expandedJobs.map((job: any) => (
                    <JobRow key={job.id} job={job} onRevise={openRevise} onImageClick={setFullScreenImage} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {reviseJob && (
        <Modal isOpen={true} onClose={() => setReviseJob(null)}>
          <h2 className="font-fredoka text-lg font-bold mb-3">Revisi Gambar Scene</h2>
          <p className="text-xs text-stone-500 mb-2">
            Isi prompt khusus untuk generate ulang gambar ini. Kosongkan untuk pakai prompt otomatis.
          </p>
          <textarea
            className="w-full border border-stone-200 rounded-xl p-3 text-sm font-mono min-h-32 resize-none focus:outline-none focus:border-teal-400"
            placeholder="Contoh: Gambar suasana malam, karakter mengenakan batik merah..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
          />
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="secondary" onClick={() => setReviseJob(null)}>Batal</Button>
            <Button
              onClick={() => requeueMutation.mutate({ jobId: reviseJob.id, prompt: customPrompt })}
              disabled={requeueMutation.isPending}
            >
              <RefreshCw size={14} className="mr-1.5" />
              {requeueMutation.isPending ? 'Mengantrekan...' : 'Regenerate'}
            </Button>
          </div>
        </Modal>
      )}

      {fullScreenImage && (
        <Modal isOpen={true} onClose={() => setFullScreenImage(null)}>
          <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[50vh]">
             <img src={fullScreenImage} alt="Full screen preview" className="w-full h-auto max-h-[85vh] object-contain" />
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
'''
with open("apps/web/src/features/admin/antrean/TabRiwayat.tsx", "w", encoding="utf-8") as f:
    f.write(content)
