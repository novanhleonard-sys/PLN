import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Modal } from '../../../ui/layers/Modal';
import { Toast } from '../../../ui/basic/Toast';
import { cn } from '../../../utils/cn';

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
      const { data } = await supabase.from('style_configs').select('*');
      return data || [];
    }
  });

  const { data: voicePersonas } = useQuery({
    queryKey: ['voice_personas'],
    queryFn: async () => {
      const { data } = await supabase.from('voice_personas').select('*');
      return data || [];
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('submissions').update({ status: 'rejected', reject_reason: rejectReason }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Cerita berhasil ditolak');
      setSelectedSub(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin_submissions'] });
    }
  });

  const processMutation = useMutation({
    mutationFn: async (id: string) => {
      const sub = selectedSub;
      const slug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Get AI location
      let lat = sub.lat;
      let lng = sub.lng;
      
      if (!lat || !lng) {
        const verifyRun = sub.verification_runs?.find((r: any) => r.stage === 'verify');
        if (verifyRun?.output?.location) {
          lat = verifyRun.output.location.lat;
          lng = verifyRun.output.location.lng;
        }
      }

      const { data: story, error: storyErr } = await supabase.from("stories").upsert({
        title: sub.title,
        slug: slug,
        type: sub.type,
        synopsis: sub.synopsis,
        lat: lat,
        lng: lng,
        hero_image_path: sub.hero_image_path,
        pin_image_path: sub.pin_image_path,
        status: 'published'
      }, { onConflict: 'slug' }).select().single();
      
      if (storyErr) throw storyErr;

      const { data: version, error: versionErr } = await supabase.from("story_versions").insert({
        story_id: story.id,
        label: sub.version_label,
        sources: sub.sources || [],
        body: sub.body,
        status: "processing"
      }).select().single();

      if (versionErr) throw versionErr;

      const { error: runErr } = await supabase.rpc('start_ai_process_run', {
         p_version_id: version.id,
         p_scope: selectedScope,
         p_config_snapshot: { 
           source: 'admin-approve',
           imagePersona,
           voicePersona,
           imageInstruction,
           voiceInstruction
         }
      });
      if (runErr) throw runErr;

      const { error: updErr } = await supabase.from('submissions').update({ status: 'approved' }).eq('id', id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      setToast('Cerita disetujui & mulai diproses AI');
      setSelectedSub(null);
      queryClient.invalidateQueries({ queryKey: ['admin_submissions'] });
    },
    onError: (e: any) => {
      setToast('Gagal memproses: ' + e.message);
    }
  });

  const getTrafficLight = (runs: any[]) => {
    if (!runs || runs.length === 0) return { color: 'gray', label: 'Diproses AI', reason: 'Menunggu hasil verifikasi...', bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
    
    const sorted = [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const latest = sorted[0];

    const reason = latest.output?.reason || 'Tidak ada alasan spesifik.';

    if (latest.stage === 'triage') {
      if (latest.verdict === 'fail') return { color: 'red', label: 'Gagal Triage', reason, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      return { color: 'gray', label: 'Lolos Triage', reason: 'Menunggu verifikasi lanjutan...', bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
    }

    if (latest.stage === 'verify') {
      if (latest.verdict === 'fail') return { color: 'red', label: 'Indikasi Palsu', reason, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      if (latest.confidence < 0.8) return { color: 'yellow', label: 'Butuh Cek Manual', reason, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' };
      return { color: 'green', label: 'Aman', reason, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    }

    return { color: 'gray', label: 'Tidak Diketahui', reason, bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' };
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="p-8 font-nunito animate-pulse">Memuat antrean...</div>
      ) : !submissions?.length ? (
        <div className="p-12 text-center text-stone-500 bg-stone-50 border border-stone-200 rounded-2xl">
          Tidak ada cerita dalam antrean saat ini.
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions?.map((sub: any) => {
            const tl = getTrafficLight(sub.verification_runs);
            return (
              <div key={sub.id} className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-start gap-4 transition hover:shadow-md">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold font-fredoka text-lg text-stone-800">{sub.title}</h3>
                    <span className={cn("text-xs px-2.5 py-1 rounded-full font-bold border uppercase tracking-wide", tl.bg, tl.text, tl.border)}>
                      {tl.label}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mb-3">Oleh: <span className="font-bold text-stone-700">{sub.profiles?.display_name}</span> &bull; Label: {sub.version_label}</p>
                  
                  <div className={cn("text-sm p-3 rounded-xl border", tl.bg, tl.text, tl.border)}>
                    <strong className="block mb-1 opacity-80 uppercase text-[10px] tracking-wider">Kesimpulan AI</strong>
                    {tl.reason}
                  </div>
                </div>
                <div className="flex-none pt-1">
                  <Button onClick={() => {
                    setSelectedSub(sub);
                    setImagePersona('');
                    setVoicePersona('');
                    setImageInstruction('');
                    setVoiceInstruction('');
                    setSelectedScope('all');
                  }}>Lihat &amp; Atur</Button>
                </div>
              </div>
            );
          })}
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
              <h4 className="font-bold text-stone-700 mb-2">Log Deteksi AI</h4>
              {selectedSub.verification_runs?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {selectedSub.verification_runs.map((run: any) => (
                    <div key={run.id} className="p-4 border border-stone-200 rounded-xl text-sm bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="uppercase font-black tracking-wider text-stone-400 text-xs">{run.stage}</span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-bold", run.verdict === 'pass' ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700')}>
                          {run.verdict.toUpperCase()} ({(run.confidence * 100).toFixed(1)}%)
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-stone-600">
                        {run.output?.location && (
                          <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <strong>Lokasi Ditemukan:</strong> {run.output.location.name} (Lat: {run.output.location.lat}, Lng: {run.output.location.lng})
                          </div>
                        )}
                        <div>
                          <strong>Alasan:</strong> {run.output?.reason || '-'}
                        </div>
                        {run.output?.originalStory && (
                          <details className="mt-2 text-xs">
                            <summary className="cursor-pointer text-teal-600 font-bold hover:underline">Lihat Teks Perbaikan Grammar AI</summary>
                            <div className="mt-2 p-3 bg-stone-50 rounded border whitespace-pre-wrap">
                              {run.output.originalStory}
                            </div>
                          </details>
                        )}
                      </div>
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
                    <option value="">-- Bawaan (Auto) --</option>
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
                    <option value="">-- Bawaan (Auto) --</option>
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
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500"
                    rows={3}
                    value={imageInstruction}
                    onChange={e => setImageInstruction(e.target.value)}
                    placeholder="Contoh: Buat suasananya malam hari..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Instruksi Khusus Suara</label>
                  <textarea 
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-500"
                    rows={3}
                    value={voiceInstruction}
                    onChange={e => setVoiceInstruction(e.target.value)}
                    placeholder="Contoh: Gunakan nada sedih..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-stone-200">
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Ketik alasan penolakan..."
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
                    className="border border-stone-300 rounded-xl px-3 py-2 text-sm outline-none bg-stone-50 flex-1 min-w-[120px]"
                    value={selectedScope}
                    onChange={(e: any) => setSelectedScope(e.target.value)}
                  >
                    <option value="all">Semua</option>
                    <option value="text_only">Teks Saja</option>
                    <option value="image_only">Gambar Saja</option>
                    <option value="audio_only">Audio Saja</option>
                  </select>
                  <Button 
                    className="flex-none whitespace-nowrap bg-teal-600 hover:bg-teal-700" 
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
