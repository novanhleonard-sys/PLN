import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Modal } from '../../../ui/layers/Modal';
import { Toast } from '../../../ui/basic/Toast';

export function TabAntrean() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedScope, setSelectedScope] = useState<'all' | 'text_only' | 'image_only' | 'audio_only'>('all');
  const [imagePersona, setImagePersona] = useState('');
  const [voicePersona, setVoicePersona] = useState('');
  const [imageInstruction, setImageInstruction] = useState('');
  const [voiceInstruction, setVoiceInstruction] = useState('');

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

  const { data: styleConfigs } = useQuery({
    queryKey: ['style_configs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('style_configs').select('id, descriptor');
      if (error) throw error;
      return data;
    }
  });

  const { data: voicePersonas } = useQuery({
    queryKey: ['voice_personas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_personas').select('id, name');
      if (error) throw error;
      return data;
    }
  });

  const processMutation = useMutation({
    mutationFn: async (subId: string) => {
      const { data: versionId, error: approveErr } = await supabase.rpc('approve_submission_to_version', {
        p_submission_id: subId
      });
      if (approveErr) throw approveErr;

      const { error: processErr } = await supabase.rpc('start_ai_process_run', {
        p_version_id: versionId,
        p_scope: selectedScope,
        p_config_snapshot: {
          imagePersona,
          voicePersona,
          imageInstruction,
          voiceInstruction
        }
      });
      if (processErr) throw processErr;
    },
    onSuccess: () => {
      setToast('Proses AI berhasil dimulai.');
      setSelectedSub(null);
      queryClient.invalidateQueries({ queryKey: ['admin_submissions'] });
    },
    onError: (error: any) => {
      setToast(`Gagal: ${error.message}`);
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
    },
    onError: (error: any) => {
      setToast(`Gagal menolak: ${error.message}`);
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
          {submissions?.map((sub: any) => (
            <div key={sub.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{sub.title}</h3>
                <p className="text-sm text-stone-500 mt-1">Oleh: {sub.profiles?.display_name}   Label: {sub.version_label}</p>
              </div>
              <Button onClick={() => {
                setSelectedSub(sub);
                setImagePersona('');
                setVoicePersona('');
                setImageInstruction('');
                setVoiceInstruction('');
                setSelectedScope('all');
              }}>Lihat Detail</Button>
            </div>
          ))}
        </div>
      )}

      {selectedSub && (
        <Modal isOpen={true} onClose={() => setSelectedSub(null)}>
          <div className="p-6 font-nunito max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <span className={run.verdict === 'pass' ? 'text-teal-600' : 'text-red-500'}>
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

            <div className="mb-6 space-y-4 border-t border-stone-200 pt-4">
              <h4 className="font-bold text-stone-700">Konfigurasi Persona & Instruksi</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Style/Image Persona</label>
                  <select 
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    value={imagePersona}
                    onChange={e => setImagePersona(e.target.value)}
                  >
                    <option value="">-- Pilih Style --</option>
                    {styleConfigs?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.descriptor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Voice Persona</label>
                  <select 
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    value={voicePersona}
                    onChange={e => setVoicePersona(e.target.value)}
                  >
                    <option value="">-- Pilih Voice --</option>
                    {voicePersonas?.map((v: any) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Instruksi Khusus Gambar</label>
                  <textarea 
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    rows={3}
                    value={imageInstruction}
                    onChange={e => setImageInstruction(e.target.value)}
                    placeholder="Instruksi tambahan untuk generasi gambar..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Instruksi Khusus Suara</label>
                  <textarea 
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none"
                    rows={3}
                    value={voiceInstruction}
                    onChange={e => setVoiceInstruction(e.target.value)}
                    placeholder="Instruksi tambahan untuk generasi suara..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-200">
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
              <div className="flex-1 flex flex-col gap-2 justify-end">
                <div className="flex gap-2 w-full">
                  <select 
                    className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none bg-stone-50 flex-1 min-w-[140px]"
                    value={selectedScope}
                    onChange={(e: any) => setSelectedScope(e.target.value)}
                  >
                    <option value="all">Semua</option>
                    <option value="text_only">Teks Saja</option>
                    <option value="image_only">Gambar Saja</option>
                    <option value="audio_only">Audio Saja</option>
                  </select>
                  <Button 
                    className="flex-none whitespace-nowrap" 
                    onClick={() => processMutation.mutate(selectedSub.id)}
                    disabled={processMutation.isPending}
                  >
                    {processMutation.isPending ? 'Proses...' : 'Mulai Proses'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
