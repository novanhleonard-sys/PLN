import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';

export function AdminKonten() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'stories' | 'jobs'>('stories');

  const { data: stories, isLoading: loadingStories } = useQuery({
    queryKey: ['admin_stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id, title, status, tier_locked, tier
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: tab === 'stories'
  });

  const { data: jobs, isLoading: loadingJobs } = useQuery({
    queryKey: ['admin_jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['failed', 'running', 'queued'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: tab === 'jobs'
  });

  const toggleLockMutation = useMutation({
    mutationFn: async ({ id, locked }: { id: string, locked: boolean }) => {
      const { error } = await supabase.from('stories').update({ tier_locked: locked }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_stories'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const newStatus = status === 'published' ? 'unpublished' : 'published';
      const { error } = await supabase.from('stories').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_stories'] });
    }
  });

  const retryJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jobs').update({ status: 'queued', attempts: 0, run_after: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Job di-reset ke antrean.');
      queryClient.invalidateQueries({ queryKey: ['admin_jobs'] });
    }
  });

  return (
    <div className="flex flex-col gap-8 font-nunito pb-12 w-full">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Kelola Konten</h2>
        <p className="text-stone-500 text-sm mt-1">
          Manajemen cerita yang telah tayang dan pantauan mesin AI (Jobs).
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
        <button 
          onClick={() => setTab('stories')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'stories' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
        >
          Daftar Cerita
        </button>
        <button 
          onClick={() => setTab('jobs')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'jobs' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
        >
          Pantauan Jobs AI
        </button>
      </div>

      {tab === 'stories' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {loadingStories ? (
            <div className="p-8 text-center animate-pulse text-stone-500">Memuat cerita...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Judul Cerita</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Tier</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stories?.map((story) => (
                  <tr key={story.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-stone-800">{story.title}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${story.status === 'published' ? 'bg-teal-100 text-teal-dark' : 'bg-stone-200 text-stone-600'}`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">
                      Tier {story.tier || 1} 
                      {story.tier_locked && <span className="ml-2 text-amber-500" title="Tier Locked">🔒</span>}
                    </td>
                    <td className="p-4 flex gap-2 justify-end">
                      <Button 
                        variant="secondary" 
                        className="!text-xs !py-1 !px-3"
                        onClick={() => navigate(`/admin/konten/edit/${story.id}`)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="!text-xs !py-1 !px-3"
                        onClick={() => toggleLockMutation.mutate({ id: story.id, locked: !story.tier_locked })}
                        disabled={toggleLockMutation.isPending}
                      >
                        {story.tier_locked ? 'Buka Tier' : 'Kunci Tier'}
                      </Button>
                      <Button 
                        variant={story.status === 'published' ? 'secondary' : 'primary'}
                        className="!text-xs !py-1 !px-3"
                        onClick={() => toggleStatusMutation.mutate({ id: story.id, status: story.status })}
                        disabled={toggleStatusMutation.isPending}
                      >
                        {story.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {stories?.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">Belum ada cerita.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'jobs' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {loadingJobs ? (
            <div className="p-8 text-center animate-pulse text-stone-500">Memuat jobs...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                <tr>
                  <th className="p-4 font-bold">Jenis Task</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Error Info</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job) => (
                  <tr key={job.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-stone-800 uppercase text-xs">{job.kind}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        job.status === 'failed' ? 'bg-red-100 text-red-600' : 
                        job.status === 'running' ? 'bg-blue-100 text-blue-600' : 
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {job.status} ({job.attempts}x)
                      </span>
                    </td>
                    <td className="p-4 text-xs text-stone-500 max-w-xs truncate" title={job.error || '-'}>
                      {job.error || '-'}
                    </td>
                    <td className="p-4 text-right">
                      {job.status === 'failed' && (
                        <Button 
                          variant="secondary" 
                          className="!text-xs !py-1 !px-3"
                          onClick={() => retryJobMutation.mutate(job.id)}
                          disabled={retryJobMutation.isPending}
                        >
                          Coba Ulang
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {jobs?.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-stone-500">Tidak ada task yang aktif atau gagal. Semuanya bersih!</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
