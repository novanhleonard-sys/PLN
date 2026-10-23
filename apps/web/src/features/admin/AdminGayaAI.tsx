import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRegionGroups } from './useRegionGroups';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { FileUploader } from '../../ui/basic/FileUploader';
import { Icon } from '../../ui/basic/Icon';
import { Modal } from '../../ui/layers/Modal';
import { MultiRegionSelect } from './MultiRegionSelect';

type StyleConfig = { id?: string; name: string; story_type: string; region_group_ids: string[]; descriptor: string; reference_paths: string[]; };
type VoicePersona = { id?: string; name: string; story_type: string; region_group_ids: string[]; voice_name: string; style_prompt: string; sample_path: string; };
type UmumConfig = { prompt: string; references: string[] };

const SCENE_TEMPLATES = [
  { id: 'custom', label: 'Tulis Sendiri...', text: '' },
  { id: 'fabel', label: 'Fabel Kancil', text: 'Kancil yang cerdik melompat dari satu batu ke batu lain untuk menghindari kejaran buaya sungai yang lapar.' },
  { id: 'legenda', label: 'Legenda Sangkuriang', text: 'Sangkuriang menendang perahu buatannya dengan penuh amarah hingga terbalik dan perlahan berubah menjadi sebuah gunung raksasa.' },
  { id: 'mite', label: 'Mite Nyi Roro Kidul', text: 'Dari balik gulungan ombak laut selatan yang ganas, muncullah Nyi Roro Kidul menaiki kereta kencana emasnya.' },
  { id: 'dongeng', label: 'Dongeng Bawang Putih', text: 'Di tepi sungai, Bawang Putih menemukan keong emas ajaib yang memancarkan cahaya menyilaukan dari cangkangnya.' },
  { id: 'umum', label: 'Netral / Alam', text: 'Di sebuah desa yang damai, angin sore meniup dedaunan kering yang berguguran jatuh menyentuh tanah basah.' },
];

export function AdminGayaAI() {
  const queryClient = useQueryClient();
  const { parentGroups, subGroups } = useRegionGroups();
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'umum' | 'styles' | 'voices'>('umum');
  const formRef = useRef<HTMLDivElement>(null);

  // States
  const [styleForm, setStyleForm] = useState<StyleConfig>({ name: '', story_type: 'legenda', region_group_ids: [], descriptor: '', reference_paths: [] });
  const [voiceForm, setVoiceForm] = useState<VoicePersona>({ name: '', story_type: 'legenda', region_group_ids: [], voice_name: '', style_prompt: '', sample_path: '' });
  
  // Umum States
  const [umumGambarForm, setUmumGambarForm] = useState<UmumConfig>({ prompt: '', references: [] });
  const [umumSuaraForm, setUmumSuaraForm] = useState<UmumConfig>({ prompt: '', references: [] });

  // Test Modal State
  const [testModal, setTestModal] = useState<{ open: boolean, kind: 'image' | 'audio', refId?: string, name: string, snapshot?: any } | null>(null);
  const [activeTestRunId, setActiveTestRunId] = useState<string | null>(null);
  const [testText, setTestText] = useState(SCENE_TEMPLATES[1].text);
  const [testTemplate, setTestTemplate] = useState(SCENE_TEMPLATES[1].id);

  // Queries
  const { data: styles, isLoading: loadS } = useQuery({ queryKey: ['admin_styles'], queryFn: async () => (await supabase.from('style_configs').select('*').order('created_at', { ascending: false })).data, enabled: tab === 'styles' });
  const { data: voices, isLoading: loadV } = useQuery({ queryKey: ['admin_voices'], queryFn: async () => (await supabase.from('voice_personas').select('*').order('created_at', { ascending: false })).data, enabled: tab === 'voices' });
  const { data: umumSettings } = useQuery({ 
    queryKey: ['admin_umum_settings'], 
    queryFn: async () => {
      const res = await supabase.from('app_settings').select('key, value').in('key', ['umum_gambar', 'umum_suara']);
      return res.data || [];
    }
  });

  // Query Active Test Run (Live Polling)
  const { data: currentTestRun } = useQuery({
    queryKey: ['admin_active_test_run', activeTestRunId],
    enabled: !!activeTestRunId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*')
        .eq('id', activeTestRunId!)
        .single();
      if (error) throw error;
      return data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'running') return 1500;
      return false;
    }
  });

  // Query Recent Test Runs History
  const { data: testHistory, isLoading: loadHistory } = useQuery({
    queryKey: ['admin_test_runs_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  // Mutations (Test Run Deletion)
  const delTestRun = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('test_runs').delete().eq('id', id).throwOnError();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_test_runs_history'] });
      setToast('Riwayat uji coba berhasil dihapus.');
    }
  });

  // Populate Umum forms once loaded
  useEffect(() => {
    if (umumSettings) {
      const gambarSet = umumSettings.find(s => s.key === 'umum_gambar');
      if (gambarSet && gambarSet.value) setUmumGambarForm(gambarSet.value);
      
      const suaraSet = umumSettings.find(s => s.key === 'umum_suara');
      if (suaraSet && suaraSet.value) setUmumSuaraForm(suaraSet.value);
    }
  }, [umumSettings]);

  // Mutations (Styles)
  const saveStyle = useMutation({
    mutationFn: async (p: StyleConfig) => {
      const payload = { name: p.name, story_type: p.story_type, region_group_ids: p.region_group_ids, descriptor: p.descriptor, reference_paths: p.reference_paths, palette: {} };
      if (p.id) await supabase.from('style_configs').update(payload).eq('id', p.id).throwOnError();
      else await supabase.from('style_configs').insert(payload).throwOnError();
    },
    onSuccess: () => { setToast('Gaya disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }); resetStyle(); }
  });
  const delStyle = useMutation({ mutationFn: async (id: string) => await supabase.from('style_configs').delete().eq('id', id).throwOnError(), onSuccess: () => { setToast('Gaya dihapus.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }) }, onError: () => setToast('Gagal menghapus: Gaya sedang digunakan (terikat ke cerita).') });

  // Mutations (Voices)
  const saveVoice = useMutation({
    mutationFn: async (p: VoicePersona) => {
      const payload = { name: p.name, story_type: p.story_type, region_group_ids: p.region_group_ids, voice_name: p.voice_name, style_prompt: p.style_prompt, sample_path: p.sample_path }; 
      if (p.id) await supabase.from('voice_personas').update(payload).eq('id', p.id).throwOnError();
      else await supabase.from('voice_personas').insert(payload).throwOnError();
    },
    onSuccess: () => { setToast('Persona disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_voices'] }); resetVoice(); }
  });
  const delVoice = useMutation({ mutationFn: async (id: string) => await supabase.from('voice_personas').delete().eq('id', id).throwOnError(), onSuccess: () => { setToast('Persona dihapus.'); queryClient.invalidateQueries({ queryKey: ['admin_voices'] }) }, onError: () => setToast('Gagal menghapus: Persona sedang digunakan (terikat ke cerita).') });

  // Mutations (Umum)
  const saveUmum = useMutation({
    mutationFn: async ({ key, payload }: { key: string, payload: UmumConfig }) => {
      await supabase.from('app_settings').update({ value: payload }).eq('key', key).throwOnError();
    },
    onSuccess: () => { setToast('Instruksi Umum disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_umum_settings'] }); }
  });

  // Mutations (Test Run)
  const runTest = useMutation({
    mutationFn: async () => {
      if (!testModal) return;
      const { data, error } = await supabase.from('test_runs').insert({
        kind: testModal.kind, text_prompt: testText, style_id: (testModal.kind === 'image' && testModal.refId) ? testModal.refId : null, voice_id: (testModal.kind === 'audio' && testModal.refId) ? testModal.refId : null, config_snapshot: testModal.snapshot || null
      }).select('id').single();
      if (error) throw error;

      await supabase.from('jobs').insert({
        kind: `test_${testModal.kind}`, ref_type: 'test_run', ref_id: data.id, idempotency_key: `test-${data.id}`, run_after: '1970-01-01T00:00:00Z'
      }).throwOnError();
      return data.id;
    },
    onSuccess: (id) => {
      if (id) setActiveTestRunId(id);
      queryClient.invalidateQueries({ queryKey: ['admin_test_runs_history'] });
      setToast('Tes dikirim ke AI Worker. Memantau progres secara langsung...');
    },
    onError: (err: any) => {
      setToast('Gagal memulai tes: ' + (err.message || 'Error'));
    }
  });

  const resetStyle = () => setStyleForm({ name: '', story_type: 'legenda', region_group_ids: [], descriptor: '', reference_paths: [] });
  const resetVoice = () => setVoiceForm({ name: '', story_type: 'legenda', region_group_ids: [], voice_name: '', style_prompt: '', sample_path: '' });
  const getUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/admin-assets/${path}`;

  return (
    <div className="flex flex-col gap-8 font-nunito pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Gaya AI & Persona Suara</h2>
        <p className="text-stone-500 text-sm mt-1">Satu tempat untuk mengatur instruksi dasar dan konfigurasi spesifik Few-Shot AI.</p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
        <button onClick={() => setTab('umum')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'umum' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}>Umum (Dasar)</button>
        <button onClick={() => { setTab('styles'); resetStyle(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'styles' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}>Gambar</button>
        <button onClick={() => { setTab('voices'); resetVoice(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'voices' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:bg-stone-200'}`}>Suara</button>
      </div>

      {tab === 'umum' && (
        <div className="flex flex-col gap-8">
          {/* Section Umum - Gambar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-1">Umum — Gambar</h3>
            <p className="text-sm text-stone-500 mb-6">Instruksi dan referensi dasar global untuk semua generasi gambar, sebelum ditambahkan aturan genre/daerah spesifik.</p>
            
            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[200px]" 
                placeholder="Tuliskan prompt dasar gambar di sini..." 
                value={umumGambarForm.prompt} 
                onChange={e => setUmumGambarForm({...umumGambarForm, prompt: e.target.value})} 
              />
              <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-700">Contoh Referensi Gambar (Multiple)</span>
                  <div className="w-32">
                    <FileUploader bucket="admin-assets" folder="styles/umum" accept="image/*" multiple label="Unggah" onUploadSuccess={p => setUmumGambarForm(s => ({...s, references: [...s.references, ...p]}))} />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto min-h-[4rem]">
                  {umumGambarForm.references.map((p, i) => (
                    <div key={i} className="relative group shrink-0">
                      <img src={getUrl(p)} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                      <button onClick={() => setUmumGambarForm(s => ({...s, references: s.references.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"><Icon name="X" size={12} /></button>
                    </div>
                  ))}
                  {umumGambarForm.references.length === 0 && <span className="text-sm text-stone-400 italic flex items-center">Belum ada contoh referensi.</span>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button disabled={saveUmum.isPending} onClick={() => saveUmum.mutate({ key: 'umum_gambar', payload: umumGambarForm })}>Simpan Instruksi Gambar</Button>
              </div>
            </div>
          </div>

          {/* Section Umum - Suara */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-1">Umum — Suara</h3>
            <p className="text-sm text-stone-500 mb-6">Instruksi dan referensi dasar global untuk semua generasi suara.</p>
            
            <div className="flex flex-col gap-4">
              <textarea 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[120px]" 
                placeholder="Tuliskan prompt dasar suara di sini..." 
                value={umumSuaraForm.prompt} 
                onChange={e => setUmumSuaraForm({...umumSuaraForm, prompt: e.target.value})} 
              />
              <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-stone-700">Contoh Referensi Suara (Multiple)</span>
                    <p className="text-[11px] text-stone-400 mt-0.5">Berkas audio acuan kurator untuk standar intonasi. AI diarahkan via Voice ID dan instruksi di atas.</p>
                  </div>
                  <div className="w-32">
                    <FileUploader bucket="admin-assets" folder="voices/umum" accept="audio/*" multiple label="Unggah" isAudio onUploadSuccess={p => setUmumSuaraForm(s => ({...s, references: [...s.references, ...p]}))} />
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  {umumSuaraForm.references.map((p, i) => (
                    <div key={i} className="relative group shrink-0 flex items-center gap-3 bg-white p-2 rounded border border-stone-100">
                      <audio controls className="h-8 flex-1" src={getUrl(p)} />
                      <button onClick={() => setUmumSuaraForm(s => ({...s, references: s.references.filter((_, idx) => idx !== i)}))} className="text-stone-400 hover:text-red-500 p-1"><Icon name="Trash" size={16} /></button>
                    </div>
                  ))}
                  {umumSuaraForm.references.length === 0 && <span className="text-sm text-stone-400 italic flex items-center h-8">Belum ada contoh referensi.</span>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button disabled={saveUmum.isPending} onClick={() => saveUmum.mutate({ key: 'umum_suara', payload: umumSuaraForm })}>Simpan Instruksi Suara</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab !== 'umum' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-8" ref={formRef}>
          {tab === 'styles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2 md:col-span-2">{styleForm.id ? 'Edit Aturan Spesifik Gambar' : 'Buat Aturan Spesifik Gambar'}</h3>
              <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" placeholder="Nama Aturan (Kartun Cerah)" value={styleForm.name} onChange={e => setStyleForm({...styleForm, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-2"><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={styleForm.story_type} onChange={e => setStyleForm({...styleForm, story_type: e.target.value})}><option value="legenda">Legenda</option><option value="mite">Mite</option><option value="fabel">Fabel</option><option value="dongeng">Dongeng</option></select><MultiRegionSelect value={styleForm.region_group_ids} onChange={val => setStyleForm({...styleForm, region_group_ids: val})} /></div><textarea className="md:col-span-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[60px]" placeholder="Instruksi spesifik (Aturan tambahan khusus genre/daerah ini...)" value={styleForm.descriptor} onChange={e => setStyleForm({...styleForm, descriptor: e.target.value})} />
              
              <div className="md:col-span-2 flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center"><span className="text-sm font-bold text-stone-700">Gambar Referensi Tambahan</span><div className="w-32"><FileUploader bucket="admin-assets" folder="styles" accept="image/*" multiple label="Unggah" onUploadSuccess={p => setStyleForm(s => ({...s, reference_paths: [...s.reference_paths, ...p]}))} /></div></div>
                <div className="flex gap-2 overflow-x-auto min-h-[4rem]">
                  {styleForm.reference_paths.map((p, i) => (
                    <div key={i} className="relative group shrink-0">
                      <img src={getUrl(p)} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                      <button onClick={() => setStyleForm(s => ({...s, reference_paths: s.reference_paths.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"><Icon name="X" size={12} /></button>
                    </div>
                  ))}
                  {styleForm.reference_paths.length === 0 && <span className="text-sm text-stone-400 italic flex items-center">Belum ada.</span>}
                </div>
              </div>
              
              <div className="md:col-span-2 flex gap-2 justify-end pt-2">
                {styleForm.id && <Button variant="secondary" onClick={resetStyle}>Batal</Button>}
                <Button variant="secondary" className="border-teal text-teal hover:bg-teal-50" disabled={!styleForm.name || !styleForm.descriptor} onClick={() => { setActiveTestRunId(null); setTestModal({ open: true, kind: 'image', name: styleForm.name, snapshot: styleForm, refId: styleForm.id }); }}>
                  <Icon name="Play" size={14} className="mr-1 inline-block" /> Tes
                </Button>
                <Button disabled={!styleForm.name || !styleForm.descriptor || saveStyle.isPending} onClick={() => saveStyle.mutate(styleForm)}>{styleForm.id ? 'Simpan' : 'Buat'}</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2">{voiceForm.id ? 'Edit Aturan Spesifik Suara' : 'Buat Aturan Spesifik Suara'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" placeholder="Nama Persona (contoh: Kakek Pendongeng)" value={voiceForm.name} onChange={e => setVoiceForm({...voiceForm, name: e.target.value})} />
                <div className="flex flex-col gap-1.5">
                  <input className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none text-stone-700 font-mono" placeholder="Voice ID (contoh: Aoede, Fenrir, Kore)" value={voiceForm.voice_name} onChange={e => setVoiceForm({...voiceForm, voice_name: e.target.value})} />
                  <div className="flex gap-1.5 flex-wrap items-center text-[11px] text-stone-500">
                    <span className="font-bold">Preset Gemini:</span>
                    {[
                      { id: 'Aoede', label: 'Aoede (Wanita Hangat)' },
                      { id: 'Kore', label: 'Kore (Wanita Tenang)' },
                      { id: 'Fenrir', label: 'Fenrir (Pria Berat)' },
                      { id: 'Charon', label: 'Charon (Pria Misterius)' },
                      { id: 'Puck', label: 'Puck (Remaja Ceria)' }
                    ].map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceForm(f => ({ ...f, voice_name: v.id }))}
                        className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${voiceForm.voice_name === v.id ? 'bg-teal-50 border-teal text-teal-dark font-bold' : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-600'}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4"><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={voiceForm.story_type} onChange={e => setVoiceForm({...voiceForm, story_type: e.target.value})}><option value="legenda">Legenda</option><option value="mite">Mite</option><option value="fabel">Fabel</option><option value="dongeng">Dongeng</option></select><MultiRegionSelect value={voiceForm.region_group_ids} onChange={val => setVoiceForm({...voiceForm, region_group_ids: val})} /></div><textarea className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[60px]" placeholder="Instruksi spesifik suara (Gaya bicara, aksen, tempo, emosi...)" value={voiceForm.style_prompt} onChange={e => setVoiceForm({...voiceForm, style_prompt: e.target.value})} />
              
              <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-bold text-stone-700">Sampel Audio (MP3) Tambahan</span>
                    <p className="text-[11px] text-stone-400 mt-0.5">Berkas sampel acuan kurasi. AI diarahkan via Voice ID dan instruksi gaya di atas.</p>
                  </div>
                  <div className="w-32"><FileUploader bucket="admin-assets" folder="voices" accept="audio/*" label="Unggah" isAudio onUploadSuccess={p => setVoiceForm(s => ({...s, sample_path: p[0]}))} /></div>
                </div>
                {voiceForm.sample_path && <audio controls className="w-full h-8" src={getUrl(voiceForm.sample_path)} />}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {voiceForm.id && <Button variant="secondary" onClick={resetVoice}>Batal</Button>}
                <Button variant="secondary" className="border-teal text-teal hover:bg-teal-50" disabled={!voiceForm.name} onClick={() => { setActiveTestRunId(null); setTestModal({ open: true, kind: 'audio', name: voiceForm.name, snapshot: voiceForm, refId: voiceForm.id }); }}>
                  <Icon name="Play" size={14} className="mr-1 inline-block" /> Tes
                </Button>
                <Button disabled={!voiceForm.name || saveVoice.isPending} onClick={() => saveVoice.mutate(voiceForm)}>{voiceForm.id ? 'Simpan' : 'Buat'}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab !== 'umum' && (
        <div className="grid gap-3 md:grid-cols-2">
          {(tab === 'styles' ? styles : voices)?.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3 justify-between hover:border-teal-light transition-colors">
              <div>
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-stone-800">{item.name}</h4>
                  <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600 uppercase">{tab === 'styles' ? item.story_type : item.story_type}</span>
                  {(item.region_group_ids || []).map((id: string) => (
                    <span key={id} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase">
                      {subGroups.find(g => g.id === id)?.name || parentGroups.find(g => g.id === id)?.name || 'DAERAH'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{tab === 'styles' ? item.descriptor : item.style_prompt}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <Button className="flex-1 !py-1 !text-xs bg-teal text-white hover:bg-teal-dark border-none" onClick={() => { setActiveTestRunId(null); setTestModal({ open: true, kind: tab === 'styles' ? 'image' : 'audio', refId: item.id, name: item.name }); }}>
                  <Icon name="Play" size={12} className="mr-1 inline-block" /> Tes
                </Button>
                <Button className="flex-1 !py-1 !text-xs" variant="secondary" onClick={() => { if(tab === 'styles') setStyleForm({...item, reference_paths: item.reference_paths||[]}); else setVoiceForm(item); formRef.current?.scrollIntoView({behavior: 'smooth'}); }}>Edit</Button>
                <button className="px-2 text-stone-400 hover:text-red-500" onClick={() => confirm('Hapus?') && (tab === 'styles' ? delStyle : delVoice).mutate(item.id)}><Icon name="Trash" size={14} /></button>
              </div>
            </div>
          ))}
          {(tab === 'styles' ? loadS : loadV) && <div className="animate-pulse text-stone-400 text-sm">Memuat...</div>}
        </div>
      )}

      {/* Section Riwayat Uji Coba */}
      <div className="mt-8 pt-8 border-t border-stone-200 flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-fredoka font-bold text-stone-800">Riwayat Uji Coba AI</h3>
            <p className="text-stone-500 text-sm mt-0.5">Daftar 10 hasil pengujian terakhir untuk gaya gambar dan persona suara.</p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin_test_runs_history'] })}
            className="text-xs text-teal hover:underline flex items-center gap-1 font-bold"
          >
            <Icon name="RotateCw" size={12} /> Segarkan
          </button>
        </div>

        {loadHistory ? (
          <div className="p-8 text-center text-stone-400 animate-pulse text-sm">Memuat riwayat pengujian...</div>
        ) : (!testHistory || testHistory.length === 0) ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-stone-400 text-sm flex flex-col items-center gap-2">
            <Icon name="Sparkles" size={28} className="text-stone-300" />
            <span>Belum ada riwayat pengujian. Klik tombol "Tes" pada aturan gambar atau persona suara di atas untuk mencoba.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testHistory.map((run: any) => {
              const targetName = run.config_snapshot?.name || (run.kind === 'image' ? styles?.find((s: any) => s.id === run.style_id)?.name : voices?.find((v: any) => v.id === run.voice_id)?.name) || 'Gaya / Persona';
              return (
                <div key={run.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${run.kind === 'image' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {run.kind === 'image' ? 'Gambar' : 'Suara'}
                      </span>
                      <span className="font-bold text-stone-800 text-sm">{targetName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        run.status === 'succeeded' ? 'bg-teal-50 text-teal-dark' :
                        run.status === 'failed' ? 'bg-red-50 text-red-600' :
                        run.status === 'running' ? 'bg-blue-50 text-blue-600 animate-pulse' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {run.status === 'succeeded' ? 'Selesai' : run.status === 'failed' ? 'Gagal' : run.status === 'running' ? 'Memproses' : 'Mengantre'}
                      </span>
                    </div>
                    <button
                      onClick={() => confirm('Hapus riwayat pengujian ini?') && delTestRun.mutate(run.id)}
                      className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                      title="Hapus"
                    >
                      <Icon name="Trash" size={14} />
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 italic line-clamp-2">"{run.text_prompt}"</p>

                  {run.status === 'succeeded' && run.result_url && (
                    <div className="mt-1">
                      {run.kind === 'image' ? (
                        <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                          <img src={run.result_url} alt="Hasil" className="w-full h-44 object-cover" />
                          <a
                            href={run.result_url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity gap-1"
                          >
                            <Icon name="ExternalLink" size={14} /> Buka Gambar
                          </a>
                        </div>
                      ) : (
                        <audio controls className="w-full h-8" src={run.result_url} />
                      )}
                    </div>
                  )}

                  {run.status === 'failed' && (
                    <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 font-mono break-all line-clamp-2">
                      {run.error || 'Gagal diproses'}
                    </p>
                  )}

                  {(run.status === 'queued' || run.status === 'running') && (
                    <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-50 p-2 rounded animate-pulse">
                      <Icon name="Loader" size={12} className="animate-spin" />
                      <span>{run.status === 'running' ? 'Sedang diproses oleh AI Worker...' : 'Mengantre di antrean Worker...'}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                    <span>{new Date(run.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} {new Date(run.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {testModal?.open && (
        <Modal isOpen onClose={() => { setTestModal(null); setActiveTestRunId(null); }}>
          <div className="p-6 font-nunito max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold font-fredoka text-stone-800">Tes {testModal.kind === 'image' ? 'Gaya Gambar' : 'Persona Suara'}</h3>
                <p className="text-xs text-stone-500 mt-0.5">Uji coba gaya <strong className="text-teal-dark">{testModal.name}</strong> dengan 1 halaman adegan.</p>
              </div>
            </div>

            {!activeTestRunId ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Pilih Template Adegan Uji Coba</label>
                  <select className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none" value={testTemplate} onChange={(e) => {
                    setTestTemplate(e.target.value);
                    setTestText(SCENE_TEMPLATES.find(t => t.id === e.target.value)?.text || '');
                  }}>
                    {SCENE_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Teks Adegan Pengujian</label>
                  <textarea 
                    className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none min-h-[120px] focus:border-teal-dark"
                    placeholder="Tuliskan 1 paragraf adegan..."
                    value={testText}
                    onChange={e => { setTestText(e.target.value); setTestTemplate('custom'); }}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="secondary" onClick={() => { setTestModal(null); setActiveTestRunId(null); }}>Batal</Button>
                  <Button disabled={!testText.trim() || runTest.isPending} onClick={() => runTest.mutate()}>
                    {runTest.isPending ? 'Mengirim...' : 'Kirim ke AI Worker'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentTestRun?.status === 'queued' && (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                    <Icon name="Clock" size={36} className="text-amber-500 animate-pulse mb-3" />
                    <h4 className="font-bold text-stone-800 text-base">Mengantre di Worker AI</h4>
                    <p className="text-xs text-stone-500 max-w-xs mt-1">Pekerjaan telah diantrekan dengan prioritas tinggi. Menunggu worker memproses...</p>
                  </div>
                )}

                {currentTestRun?.status === 'running' && (
                  <div className="flex flex-col items-center justify-center p-8 text-center bg-teal-50/50 rounded-2xl border border-teal-200">
                    <Icon name="Loader" size={36} className="text-teal animate-spin mb-3" />
                    <h4 className="font-bold text-stone-800 text-base">AI Sedang Memproses</h4>
                    <p className="text-xs text-stone-500 max-w-xs mt-1">Gemini sedang menghasilkan {testModal.kind === 'image' ? 'gambar' : 'suara'} sesuai instruksi gaya...</p>
                  </div>
                )}

                {currentTestRun?.status === 'succeeded' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-teal-dark font-bold text-xs bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
                      <Icon name="CircleCheck" size={16} />
                      <span>Hasil Uji Coba Berhasil Dihasilkan!</span>
                    </div>

                    {testModal.kind === 'image' && currentTestRun.result_url && (
                      <div className="flex flex-col gap-2">
                        <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center max-h-72">
                          <img src={currentTestRun.result_url} alt="Hasil Tes" className="w-full h-auto max-h-72 object-contain" />
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-400">Model: Gemini 3.1 Flash Image</span>
                          <a href={currentTestRun.result_url} target="_blank" rel="noreferrer" className="text-teal hover:underline flex items-center gap-1 font-bold">
                            <Icon name="ExternalLink" size={12} /> Buka Gambar Penuh
                          </a>
                        </div>
                      </div>
                    )}

                    {testModal.kind === 'audio' && currentTestRun.result_url && (
                      <div className="flex flex-col gap-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="flex justify-between items-center text-xs text-stone-500">
                          <span className="font-bold text-stone-700">Audio Narasi (Opus/Ogg)</span>
                          <span>Model: Gemini 3.8 Flash TTS</span>
                        </div>
                        <audio controls autoPlay className="w-full h-10 mt-1" src={currentTestRun.result_url} />
                      </div>
                    )}

                    <div className="text-xs text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100 italic">
                      "{currentTestRun.text_prompt}"
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-stone-100">
                      <Button variant="secondary" onClick={() => setActiveTestRunId(null)}>Tes Adegan Lain</Button>
                      <Button onClick={() => { setTestModal(null); setActiveTestRunId(null); }}>Selesai</Button>
                    </div>
                  </div>
                )}

                {currentTestRun?.status === 'failed' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-2xl border border-red-200">
                      <Icon name="CircleAlert" size={32} className="text-red-500 mb-2" />
                      <h4 className="font-bold text-red-800 text-sm">Gagal Menghasilkan {testModal.kind === 'image' ? 'Gambar' : 'Suara'}</h4>
                      <p className="text-xs text-red-600 mt-1 max-w-sm font-mono break-all">{currentTestRun?.error || 'Terjadi kesalahan pada AI Worker.'}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" onClick={() => setActiveTestRunId(null)}>Coba Lagi</Button>
                      <Button onClick={() => { setTestModal(null); setActiveTestRunId(null); }}>Tutup</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
