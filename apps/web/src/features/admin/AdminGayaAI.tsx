import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRegionGroups } from './useRegionGroups';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { FileUploader } from '../../ui/basic/FileUploader';
import { Icon } from '../../ui/basic/Icon';
import { Modal } from '../../ui/layers/Modal';

type StyleConfig = { id?: string; name: string; story_type: string; region_group: string | null; descriptor: string; reference_paths: string[]; };
type VoicePersona = { id?: string; name: string; story_type: string; region_group: string | null; voice_name: string; style_prompt: string; sample_path: string; };
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
  const { regionGroups } = useRegionGroups();
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'umum' | 'styles' | 'voices'>('umum');
  const formRef = useRef<HTMLDivElement>(null);

  // States
  const [styleForm, setStyleForm] = useState<StyleConfig>({ name: '', story_type: 'legenda', region_group: '', descriptor: '', reference_paths: [] });
  const [voiceForm, setVoiceForm] = useState<VoicePersona>({ name: '', story_type: 'legenda', region_group: '', voice_name: '', style_prompt: '', sample_path: '' });
  
  // Umum States
  const [umumGambarForm, setUmumGambarForm] = useState<UmumConfig>({ prompt: '', references: [] });
  const [umumSuaraForm, setUmumSuaraForm] = useState<UmumConfig>({ prompt: '', references: [] });

  // Test Modal State
  const [testModal, setTestModal] = useState<{ open: boolean, kind: 'image' | 'audio', refId?: string, name: string, snapshot?: any } | null>(null);
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
      const payload = { name: p.name, story_type: p.story_type, region_group: p.region_group || null, descriptor: p.descriptor, reference_paths: p.reference_paths, palette: {} };
      if (p.id) await supabase.from('style_configs').update(payload).eq('id', p.id).throwOnError();
      else await supabase.from('style_configs').insert(payload).throwOnError();
    },
    onSuccess: () => { setToast('Gaya disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }); resetStyle(); }
  });
  const delStyle = useMutation({ mutationFn: async (id: string) => await supabase.from('style_configs').delete().eq('id', id).throwOnError(), onSuccess: () => { setToast('Gaya dihapus.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }) }, onError: () => setToast('Gagal menghapus: Gaya sedang digunakan (terikat ke cerita).') });

  // Mutations (Voices)
  const saveVoice = useMutation({
    mutationFn: async (p: VoicePersona) => {
      const payload = { name: p.name, story_type: p.story_type, region_group: p.region_group || null, voice_name: p.voice_name, style_prompt: p.style_prompt, sample_path: p.sample_path }; 
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
    onSuccess: () => { setToast('Tes diprioritaskan! Pantau di tab Konten.'); setTestModal(null); }
  });

  const resetStyle = () => setStyleForm({ name: '', story_type: 'legenda', region_group: '', descriptor: '', reference_paths: [] });
  const resetVoice = () => setVoiceForm({ name: '', story_type: 'legenda', region_group: '', voice_name: '', style_prompt: '', sample_path: '' });
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
                  <span className="text-sm font-bold text-stone-700">Contoh Referensi Suara (Multiple)</span>
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
              <div className="grid grid-cols-2 gap-2"><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={styleForm.story_type} onChange={e => setStyleForm({...styleForm, story_type: e.target.value})}><option value="legenda">Legenda</option><option value="mite">Mite</option><option value="fabel">Fabel</option><option value="dongeng">Dongeng</option></select><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={styleForm.region_group || ''} onChange={e => setStyleForm({...styleForm, region_group: e.target.value})}><option value="">Daerah: Global</option>{regionGroups.map((g: any) => (<option key={g.id} value={g.slug}>{g.name}</option>))}</select></div><textarea className="md:col-span-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[60px]" placeholder="Instruksi spesifik (Aturan tambahan khusus genre/daerah ini...)" value={styleForm.descriptor} onChange={e => setStyleForm({...styleForm, descriptor: e.target.value})} />
              
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
                <Button variant="secondary" className="border-teal text-teal hover:bg-teal-50" disabled={!styleForm.name || !styleForm.descriptor} onClick={() => setTestModal({ open: true, kind: 'image', name: styleForm.name, snapshot: styleForm, refId: styleForm.id })}>
                  <Icon name="Play" size={14} className="mr-1 inline-block" /> Tes
                </Button>
                <Button disabled={!styleForm.name || !styleForm.descriptor || saveStyle.isPending} onClick={() => saveStyle.mutate(styleForm)}>{styleForm.id ? 'Simpan' : 'Buat'}</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2">{voiceForm.id ? 'Edit Aturan Spesifik Suara' : 'Buat Aturan Spesifik Suara'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" placeholder="Nama Persona (Bapak Tua)" value={voiceForm.name} onChange={e => setVoiceForm({...voiceForm, name: e.target.value})} />
                <div className="relative"><input className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm outline-none text-stone-500 font-mono" placeholder="Voice ID (Otomatis)" value={voiceForm.voice_name} readOnly /><span className="absolute right-3 top-3 text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-bold">AUTO</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={voiceForm.story_type} onChange={e => setVoiceForm({...voiceForm, story_type: e.target.value})}><option value="legenda">Legenda</option><option value="mite">Mite</option><option value="fabel">Fabel</option><option value="dongeng">Dongeng</option></select><select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={voiceForm.region_group || ''} onChange={e => setVoiceForm({...voiceForm, region_group: e.target.value})}><option value="">Daerah: Global</option>{regionGroups.map((g: any) => (<option key={g.id} value={g.slug}>{g.name}</option>))}</select></div><textarea className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[60px]" placeholder="Instruksi spesifik suara (Gaya bicara, aksen, dsb...)" value={voiceForm.style_prompt} onChange={e => setVoiceForm({...voiceForm, style_prompt: e.target.value})} />
              
              <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between items-center"><span className="text-sm font-bold text-stone-700">Sampel Audio (MP3) Tambahan</span><div className="w-32"><FileUploader bucket="admin-assets" folder="voices" accept="audio/*" label="Unggah" isAudio onUploadSuccess={p => setVoiceForm(s => ({...s, sample_path: p[0]}))} /></div></div>
                {voiceForm.sample_path && <audio controls className="w-full h-8" src={getUrl(voiceForm.sample_path)} />}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {voiceForm.id && <Button variant="secondary" onClick={resetVoice}>Batal</Button>}
                <Button variant="secondary" className="border-teal text-teal hover:bg-teal-50" disabled={!voiceForm.name || !voiceForm.voice_name} onClick={() => setTestModal({ open: true, kind: 'audio', name: voiceForm.name, snapshot: voiceForm, refId: voiceForm.id })}>
                  <Icon name="Play" size={14} className="mr-1 inline-block" /> Tes
                </Button>
                <Button disabled={!voiceForm.name || !voiceForm.voice_name || saveVoice.isPending} onClick={() => saveVoice.mutate(voiceForm)}>{voiceForm.id ? 'Simpan' : 'Buat'}</Button>
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
                  {item.region_group && <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase">{item.region_group}</span>}
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{tab === 'styles' ? item.descriptor : item.style_prompt}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <Button className="flex-1 !py-1 !text-xs bg-teal text-white hover:bg-teal-dark border-none" onClick={() => setTestModal({ open: true, kind: tab === 'styles' ? 'image' : 'audio', refId: item.id, name: item.name })}>
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

      {testModal?.open && (
        <Modal isOpen onClose={() => setTestModal(null)}>
          <div className="p-6 font-nunito max-w-lg">
            <h3 className="text-xl font-bold font-fredoka text-stone-800 mb-1">Tes {testModal.kind === 'image' ? 'Gambar' : 'Suara'}</h3>
            <p className="text-sm text-stone-500 mb-6">Uji coba gaya <strong className="text-teal-dark">{testModal.name}</strong> dengan 1 halaman adegan (prioritas tinggi di Worker).</p>

            <select className="w-full mb-3 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none" value={testTemplate} onChange={(e) => {
              setTestTemplate(e.target.value);
              setTestText(SCENE_TEMPLATES.find(t => t.id === e.target.value)?.text || '');
            }}>
              {SCENE_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>

            <textarea 
              className="w-full px-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none min-h-[120px] focus:border-teal-dark mb-6"
              placeholder="Tuliskan 1 paragraf adegan..."
              value={testText}
              onChange={e => { setTestText(e.target.value); setTestTemplate('custom'); }}
            />

            <Button className="w-full" disabled={!testText.trim() || runTest.isPending} onClick={() => runTest.mutate()}>
              {runTest.isPending ? 'Mengantrekan...' : 'Kirim ke AI Worker'}
            </Button>
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
