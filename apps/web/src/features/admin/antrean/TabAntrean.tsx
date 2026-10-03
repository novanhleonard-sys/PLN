import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Modal } from '../../../ui/layers/Modal';
import { Toast } from '../../../ui/basic/Toast';
import { Icon } from '../../../ui/basic/Icon';
import { cn } from '../../../utils/cn';

export function TabAntrean() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  
  // Modal states
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Edit states
  const [isEditingBody, setIsEditingBody] = useState(false);
  const [editedBody, setEditedBody] = useState('');

  // Config states
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
        body: editedBody || sub.body,
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

  const openModal = (sub: any) => {
    setSelectedSub(sub);
    setEditedBody(sub.body || '');
    setIsEditingBody(false);
    setImagePersona('');
    setVoicePersona('');
    setImageInstruction('');
    setVoiceInstruction('');
    setSelectedScope('all');
    setRejectReason('');
  };

  const getPublicUrl = (path: string) => {
    if (!path) return '';
    return supabase.storage.from('assets').getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="p-8 font-nunito animate-pulse flex flex-col gap-4">
           <div className="h-24 bg-stone-100 rounded-2xl w-full"></div>
           <div className="h-24 bg-stone-100 rounded-2xl w-full"></div>
        </div>
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
                    <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold border uppercase tracking-wider", tl.bg, tl.text, tl.border)}>
                      {tl.label}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mb-4">
                    Oleh: <span className="font-bold text-stone-700">{sub.profiles?.display_name}</span> &bull; Label: {sub.version_label}
                  </p>
                  <div className={cn("text-sm px-4 py-3 rounded-xl border flex gap-3", tl.bg, tl.text, tl.border)}>
                    <div className="pt-0.5 opacity-70"><Icon name="Info" size={16} /></div>
                    <div>
                      <strong className="block mb-0.5 opacity-80 uppercase text-[10px] tracking-wider">Kesimpulan AI</strong>
                      <span className="leading-relaxed">{tl.reason}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-none pt-1">
                  <Button onClick={() => openModal(sub)}>Lihat Detail</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSub && (
        <Modal isOpen={true} onClose={() => setSelectedSub(null)} className="max-w-4xl !p-0">
          <div className="flex flex-col h-[85vh]">
            
            {/* STICKY HEADER */}
            <div className="flex-none p-6 border-b border-stone-100 bg-white/80 backdrop-blur z-10 mr-12">
              <h3 className="text-3xl font-fredoka font-bold text-stone-800 mb-1">{selectedSub.title}</h3>
              <p className="text-sm text-stone-500">
                Penulis: <span className="font-bold text-stone-700">{selectedSub.profiles?.display_name}</span> &bull; 
                Tipe: <span className="uppercase text-xs font-bold tracking-wider">{selectedSub.type}</span>
              </p>
            </div>
            
            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-6 font-nunito space-y-8 bg-stone-50/50">
              
              {/* SECTION: Teks Cerita */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                    <Icon name="FileText" size={20} className="text-teal-600" />
                    Teks Cerita
                  </h4>
                  <button 
                    onClick={() => setIsEditingBody(!isEditingBody)}
                    className="text-sm font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition"
                  >
                    <Icon name={isEditingBody ? "Check" : "Pencil"} size={16} />
                    {isEditingBody ? "Selesai Edit" : "Edit Teks"}
                  </button>
                </div>
                
                {isEditingBody ? (
                  <textarea 
                    className="w-full min-h-[300px] border-2 border-teal-200 focus:border-teal-500 rounded-xl p-4 text-stone-700 leading-relaxed outline-none transition bg-teal-50/20"
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    placeholder="Ketik isi cerita di sini..."
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                    {editedBody}
                  </p>
                )}
              </section>

              {/* SECTION: Sumber & Gambar */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                  <Icon name="Link" size={20} className="text-indigo-600" />
                  Sumber & Aset Kontributor
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-sm text-stone-500 uppercase tracking-wider mb-3">Referensi</h5>
                    {selectedSub.sources?.length > 0 ? (
                      <ul className="space-y-3">
                        {selectedSub.sources.map((s: any, idx: number) => (
                          <li key={idx} className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-sm flex gap-3">
                             <div className="text-indigo-400 pt-0.5"><Icon name="BookOpen" size={16}/></div>
                             <div>
                               <span className="block font-bold text-stone-700">{s.author || 'Anonim'} <span className="text-xs font-normal text-stone-400 bg-stone-200 px-1.5 py-0.5 rounded">{s.type}</span></span>
                               <span className="text-stone-600">{s.citation}</span>
                             </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-stone-400 italic">Tidak melampirkan referensi.</p>
                    )}
                  </div>
                  
                  <div>
                     <h5 className="font-bold text-sm text-stone-500 uppercase tracking-wider mb-3">Aset Gambar</h5>
                     <div className="flex gap-4">
                       {selectedSub.hero_image_path ? (
                         <div className="group relative w-24 h-24 rounded-lg border-2 border-stone-200 overflow-hidden bg-stone-50">
                           <img src={getPublicUrl(selectedSub.hero_image_path)} alt="Hero" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold text-center p-1">Hero Image</div>
                         </div>
                       ) : (
                         <div className="w-24 h-24 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">Tanpa Hero</div>
                       )}

                       {selectedSub.pin_image_path ? (
                         <div className="group relative w-24 h-24 rounded-lg border-2 border-stone-200 overflow-hidden bg-stone-50">
                           <img src={getPublicUrl(selectedSub.pin_image_path)} alt="Pin" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold text-center p-1">Pin Marker</div>
                         </div>
                       ) : (
                         <div className="w-24 h-24 rounded-lg border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">Tanpa Marker</div>
                       )}
                     </div>
                     {selectedSub.asset_credits && (
                       <p className="text-xs text-stone-500 mt-2">Kredit visual: <span className="font-bold">{selectedSub.asset_credits}</span></p>
                     )}
                  </div>
                </div>
              </section>

              {/* SECTION: Analisis AI */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                  <Icon name="Cpu" size={20} className="text-rose-500" />
                  Log Analisis AI
                </h4>
                
                {selectedSub.verification_runs?.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedSub.verification_runs.map((run: any) => {
                       const isPass = run.verdict === 'pass';
                       return (
                        <div key={run.id} className={cn("p-4 border rounded-xl text-sm flex flex-col", isPass ? "bg-teal-50/30 border-teal-100" : "bg-red-50/30 border-red-100")}>
                          <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
                            <div>
                               <span className="uppercase font-black tracking-wider text-stone-500 text-xs block mb-1">{run.stage}</span>
                               <span className="text-[10px] text-stone-400 font-mono">{new Date(run.created_at).toLocaleString()}</span>
                            </div>
                            <span className={cn("px-2.5 py-1 rounded text-xs font-bold border", isPass ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-red-100 text-red-700 border-red-200')}>
                              {run.verdict.toUpperCase()} ({(run.confidence * 100).toFixed(0)}%)
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-stone-700 flex-1">
                            {run.output?.location && (
                              <div className="bg-white p-3 rounded-lg border border-stone-100 shadow-sm flex gap-3 items-start">
                                <div className="text-teal-500 pt-0.5"><Icon name="MapPin" size={16}/></div>
                                <div>
                                  <strong className="block mb-0.5">Lokasi Terdeteksi</strong>
                                  {run.output.location.name} <br/>
                                  <span className="text-xs text-stone-400 font-mono">{run.output.location.lat}, {run.output.location.lng}</span>
                                </div>
                              </div>
                            )}
                            <div>
                              <strong className="block text-xs uppercase text-stone-500 mb-1">Alasan Penilaian</strong> 
                              <span className="leading-relaxed">{run.output?.reason || '-'}</span>
                            </div>
                            {run.output?.originalStory && (
                              <details className="mt-2 text-xs group">
                                <summary className="cursor-pointer text-teal-600 font-bold hover:underline select-none">Lihat Saran Teks AI</summary>
                                <div className="mt-2 p-3 bg-white rounded border border-stone-200 whitespace-pre-wrap shadow-inner leading-relaxed">
                                  {run.output.originalStory}
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl text-stone-500">
                    Belum ada log analisis AI.
                  </div>
                )}
              </section>

              {/* SECTION: Konfigurasi */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="font-bold text-lg text-stone-800 mb-4 flex items-center gap-2">
                  <Icon name="Settings" size={20} className="text-stone-600" />
                  Konfigurasi Pembangkitan AI
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1.5">Style / Image Persona</label>
                    <select 
                      className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-teal-50/10 transition"
                      value={imagePersona}
                      onChange={e => setImagePersona(e.target.value)}
                    >
                      <option value="">-- Bawaan (Berdasarkan Tipe) --</option>
                      {styleConfigs?.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.descriptor}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1.5">Voice Persona</label>
                    <select 
                      className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:bg-teal-50/10 transition"
                      value={voicePersona}
                      onChange={e => setVoicePersona(e.target.value)}
                    >
                      <option value="">-- Bawaan (Otomatis) --</option>
                      {voicePersonas?.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1.5">Instruksi Ekstra (Gambar)</label>
                    <textarea 
                      className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-teal-50/10 transition"
                      rows={2}
                      value={imageInstruction}
                      onChange={e => setImageInstruction(e.target.value)}
                      placeholder="Misal: Suasana gelap dan mendung..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-600 mb-1.5">Instruksi Ekstra (Suara)</label>
                    <textarea 
                      className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 focus:bg-teal-50/10 transition"
                      rows={2}
                      value={voiceInstruction}
                      onChange={e => setVoiceInstruction(e.target.value)}
                      placeholder="Misal: Bicara perlahan dengan nada sedih..."
                    />
                  </div>
                </div>
              </section>

            </div>

            {/* STICKY FOOTER */}
            <div className="flex-none p-5 border-t border-stone-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
              <div className="flex flex-col lg:flex-row gap-6 justify-between">
                
                {/* REJECT CONTROLS */}
                <div className="flex flex-1 gap-3 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <input 
                      type="text" 
                      placeholder="Ketik alasan penolakan..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full border-2 border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:border-red-500 outline-none text-sm transition"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                       <Icon name="CircleAlert" size={18} />
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="!text-red-600 !border-red-200 hover:!bg-red-50 whitespace-nowrap"
                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(selectedSub.id)}
                  >
                    {rejectMutation.isPending ? 'Menolak...' : 'Tolak & Beri Notif'}
                  </Button>
                </div>

                {/* APPROVE CONTROLS */}
                <div className="flex gap-3 items-center border-t lg:border-t-0 lg:border-l border-stone-200 pt-4 lg:pt-0 lg:pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden sm:block">Mode:</span>
                    <select 
                      className="border-2 border-stone-200 rounded-xl px-3 py-2.5 text-sm font-bold text-stone-700 outline-none bg-stone-50 hover:bg-stone-100 transition focus:border-teal-500 cursor-pointer"
                      value={selectedScope}
                      onChange={(e: any) => setSelectedScope(e.target.value)}
                    >
                      <option value="all">🚀 FULL (Semua Aset)</option>
                      <option value="text_only">📝 Hanya Teks & Info</option>
                      <option value="image_only">🖼️ Hanya Update Gambar</option>
                      <option value="audio_only">🔊 Hanya Update Audio</option>
                    </select>
                  </div>
                  <Button 
                    className="whitespace-nowrap shadow-lg shadow-teal-500/20 px-6 font-bold" 
                    onClick={() => processMutation.mutate(selectedSub.id)}
                    disabled={processMutation.isPending}
                  >
                    {processMutation.isPending ? 'Memproses...' : 'Setujui & Proses AI'}
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
