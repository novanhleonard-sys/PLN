import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Modal } from '../../ui/layers/Modal';
import { Toast } from '../../ui/basic/Toast';

export function AdminAntrean() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin_submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles(display_name),
          verification_runs(*)
        `)
        .eq('status', 'needs_review')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('submissions').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Kiriman disetujui, masuk ke antrean pipeline.');
      setSelectedSub(null);
      queryClient.invalidateQueries({ queryKey: ['admin_submissions'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('submissions').update({ 
        status: 'rejected',
        reject_reason: rejectReason
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Kiriman ditolak.');
      setSelectedSub(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin_submissions'] });
    }
  });

  if (isLoading) return <div className="p-8 font-nunito animate-pulse">Memuat antrean...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Antrean Moderasi</h2>
        <p className="text-stone-500 text-sm mt-1">
          Daftar cerita yang memerlukan tinjauan manual (plagiarisme, konten sensitif, atau nilai kepastian AI rendah).
        </p>
      </div>

      {submissions?.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Tidak ada cerita dalam antrean saat ini.
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions?.map((sub) => (
            <div key={sub.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{sub.title}</h3>
                <p className="text-sm text-stone-500 mt-1">Oleh: {sub.profiles?.display_name} • Label: {sub.version_label}</p>
              </div>
              <Button onClick={() => setSelectedSub(sub)}>Lihat Detail</Button>
            </div>
          ))}
        </div>
      )}

      {selectedSub && (
        <Modal isOpen={true} onClose={() => setSelectedSub(null)}>
          <div className="p-6 font-nunito max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-fredoka font-bold text-stone-800 mb-2">{selectedSub.title}</h3>
            <p className="text-sm text-stone-500 mb-6">Penulis: {selectedSub.profiles?.display_name} | Tipe: {selectedSub.type}</p>
            
            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="font-bold text-stone-700 mb-2">Teks Cerita</h4>
              <p className="whitespace-pre-wrap text-stone-600 text-sm leading-relaxed max-h-64 overflow-y-auto">
                {selectedSub.body}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-stone-700 mb-2">Hasil Verifikasi AI</h4>
              {selectedSub.verification_runs?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {selectedSub.verification_runs.map((run: any) => (
                    <div key={run.id} className="p-3 border border-stone-200 rounded-xl text-sm">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="uppercase text-stone-500">{run.stage}</span>
                        <span className={run.verdict === 'pass' ? 'text-teal' : 'text-red-500'}>
                          {run.verdict.toUpperCase()} ({(run.confidence * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <pre className="text-xs bg-stone-100 p-2 rounded text-stone-600 overflow-x-auto">
                        {JSON.stringify(run.output, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">Belum ada data verifikasi (Mungkin AI mogok saat verifikasi).</p>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-stone-200">
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Alasan penolakan (Wajib jika menolak)"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-2 focus:border-red-500 outline-none text-sm"
                />
                <Button 
                  variant="secondary" 
                  className="!text-red-600 !border-red-200 hover:!bg-red-50 w-full"
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(selectedSub.id)}
                >
                  {rejectMutation.isPending ? 'Memproses...' : 'Tolak Cerita'}
                </Button>
              </div>
              <div className="flex-1 flex items-end">
                <Button 
                  className="w-full h-[42px]" 
                  onClick={() => approveMutation.mutate(selectedSub.id)}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? 'Memproses...' : 'Setujui & Terbitkan'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
