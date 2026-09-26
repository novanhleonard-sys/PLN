import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { FileUploader } from '../../ui/basic/FileUploader';
import { Icon } from '../../ui/basic/Icon';
import { Modal } from '../../ui/layers/Modal';

type StyleConfig = { id?: string; name: string; story_type: string; region_group: string | null; descriptor: string; reference_paths: string[]; };
type VoicePersona = { id?: string; name: string; voice_name: string; style_prompt: string; sample_path: string; };

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
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'styles' | 'voices'>('styles');
  const formRef = useRef<HTMLDivElement>(null);

  // States
  const [styleForm, setStyleForm] = useState<StyleConfig>({ name: '', story_type: 'legenda', region_group: '', descriptor: '', reference_paths: [] });
  const [voiceForm, setVoiceForm] = useState<VoicePersona>({ name: '', voice_name: '', style_prompt: '', sample_path: '' });
  
  // Test Modal State
  const [testModal, setTestModal] = useState<{ open: boolean, kind: 'image' | 'audio', refId: string, name: string } | null>(null);
  const [testText, setTestText] = useState(SCENE_TEMPLATES[1].text);
  const [testTemplate, setTestTemplate] = useState(SCENE_TEMPLATES[1].id);

  // Queries
  const { data: styles, isLoading: loadS } = useQuery({ queryKey: ['admin_styles'], queryFn: async () => (await supabase.from('style_configs').select('*').order('created_at', { ascending: false })).data, enabled: tab === 'styles' });
  const { data: voices, isLoading: loadV } = useQuery({ queryKey: ['admin_voices'], queryFn: async () => (await supabase.from('voice_personas').select('*').order('created_at', { ascending: false })).data, enabled: tab === 'voices' });

  // Mutations (Styles)
  const saveStyle = useMutation({
    mutationFn: async (p: StyleConfig) => {
      const payload = { name: p.name, story_type: p.story_type, region_group: p.region_group || null, descriptor: p.descriptor, reference_paths: p.reference_paths, palette: {} };
      if (p.id) await supabase.from('style_configs').update(payload).eq('id', p.id).throwOnError();
      else await supabase.from('style_configs').insert(payload).throwOnError();
    },
    onSuccess: () => { setToast('Gaya disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }); resetStyle(); }
  });
  const delStyle = useMutation({ mutationFn: async (id: string) => await supabase.from('style_configs').delete().eq('id', id).throwOnError(), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_styles'] }) });

  // Mutations (Voices)
  const saveVoice = useMutation({
    mutationFn: async (p: VoicePersona) => {
      if (p.id) await supabase.from('voice_personas').update(p).eq('id', p.id).throwOnError();
      else await supabase.from('voice_personas').insert(p).throwOnError();
    },
    onSuccess: () => { setToast('Persona disimpan.'); queryClient.invalidateQueries({ queryKey: ['admin_voices'] }); resetVoice(); }
  });
  const delVoice = useMutation({ mutationFn: async (id: string) => await supabase.from('voice_personas').delete().eq('id', id).throwOnError(), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_voices'] }) });

  // Mutations (Test Run)
  const runTest = useMutation({
    mutationFn: async () => {
      if (!testModal) return;
      const { data, error } = await supabase.from('test_runs').insert({
        kind: testModal.kind, text_prompt: testText, style_id: testModal.kind === 'image' ? testModal.refId : null, voice_id: testModal.kind === 'audio' ? testModal.refId : null
      }).select('id').single();
      if (error) throw error;

      // Insert high priority job
      await supabase.from('jobs').insert({
        kind: `test_${testModal.kind}`, ref_type: 'test_run', ref_id: data.id, idempotency_key: `test-${data.id}`, run_after: '1970-01-01T00:00:00Z' // priority
      }).throwOnError();
      return data.id;
    },
    onSuccess: () => { setToast('Tes diprioritaskan! Pantau di tab Konten.'); setTestModal(null); }
  });

  const resetStyle = () => setStyleForm({ name: '', story_type: 'legenda', region_group: '', descriptor: '', reference_paths: [] });
  const resetVoice = () => setVoiceForm({ name: '', voice_name: '', style_prompt: '', sample_path: '' });
  const getUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/admin-assets/${path}`;

  return (
    <div className="flex flex-col gap-8 font-nunito pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Gaya AI & Persona Suara</h2>
        <p className="text-stone-500 text-sm mt-1">Satu tempat untuk mengatur prompt teks dan aset referensi Few-Shot AI.</p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
        <button onClick={() => { setTab('styles'); resetStyle(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'styles' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>Gaya Visual</button>
        <button onClick={() => { setTab('voices'); resetVoice(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'voices' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}>Persona Suara</button>
      </div>

      <div ref={formRef} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
        {tab === 'styles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="md:col-span-2 text-xl font-fredoka font-bold text-stone-800 mb-2">{styleForm.id ? 'Edit Gaya' : 'Buat Gaya'}</h3>
            <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" placeholder="Nama (Misal: Wayang)" value={styleForm.name} onChange={e => setStyleForm({...styleForm, name: e.target.value})} />
            <select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" value={styleForm.story_type} onChange={e => setStyleForm({...styleForm, story_type: e.target.value})}>
              <option value="legenda">Legenda</option><option value="mite">Mite</option><option value="fabel">Fabel</option><option value="dongeng">Dongeng</option>
            </select>
            <select className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none md:col-span-2" value={styleForm.region_group || ''} onChange={e => setStyleForm({...styleForm, region_group: e.target.value})}>
              <option value="">Daerah: Global</option><option value="jawa">Jawa</option><option value="sumatra">Sumatra</option><option value="kalimantan">Kalimantan</option><option value="sulawesi">Sulawesi</option><option value="papua">Papua</option><option value="nusa_bali">Nusa Tenggara & Bali</option><option value="maluku">Maluku</option>
            </select>
            <textarea className="md:col-span-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[80px]" placeholder="Prompt (Cat minyak, surealis...)" value={styleForm.descriptor} onChange={e => setStyleForm({...styleForm, descriptor: e.target.value})} />
            
            <div className="md:col-span-2 flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex justify-between items-center"><span className="text-sm font-bold text-stone-700">Gambar Referensi (Multiple)</span><div className="w-32"><FileUploader bucket="admin-assets" folder="styles" accept="image/*" multiple label="Unggah" onUploadSuccess={p => setStyleForm(s => ({...s, reference_paths: [...s.reference_paths, ...p]}))} /></div></div>
              <div className="flex gap-2 overflow-x-auto">
                {styleForm.reference_paths.map((p, i) => (
                  <div key={i} className="relative group shrink-0">
                    <img src={getUrl(p)} className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                    <button onClick={() => setStyleForm(s => ({...s, reference_paths: s.reference_paths.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"><Icon name="X" size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2 flex gap-2 justify-end pt-2">
              {styleForm.id && <Button variant="secondary" onClick={resetStyle}>Batal</Button>}
              <Button disabled={!styleForm.name || !styleForm.descriptor || saveStyle.isPending} onClick={() => saveStyle.mutate(styleForm)}>{styleForm.id ? 'Simpan' : 'Buat'}</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-2">{voiceForm.id ? 'Edit Persona' : 'Buat Persona'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" placeholder="Nama Persona (Bapak Tua)" value={voiceForm.name} onChange={e => setVoiceForm({...voiceForm, name: e.target.value})} />
              <input className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark font-mono" placeholder="Voice ID (id-ID-Wavenet-B)" value={voiceForm.voice_name} onChange={e => setVoiceForm({...voiceForm, voice_name: e.target.value})} />
            </div>
            <textarea className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark min-h-[60px]" placeholder="Deskripsi karakter (Suara berat, pelan...)" value={voiceForm.style_prompt} onChange={e => setVoiceForm({...voiceForm, style_prompt: e.target.value})} />
            
            <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="flex justify-between items-center"><span className="text-sm font-bold text-stone-700">Sampel Audio (MP3)</span><div className="w-32"><FileUploader bucket="admin-assets" folder="voices" accept="audio/*" label="Unggah" isAudio onUploadSuccess={p => setVoiceForm(s => ({...s, sample_path: p[0]}))} /></div></div>
              {voiceForm.sample_path && <audio controls className="w-full h-8" src={getUrl(voiceForm.sample_path)} />}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              {voiceForm.id && <Button variant="secondary" onClick={resetVoice}>Batal</Button>}
              <Button disabled={!voiceForm.name || !voiceForm.voice_name || saveVoice.isPending} onClick={() => saveVoice.mutate(voiceForm)}>{voiceForm.id ? 'Simpan' : 'Buat'}</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(tab === 'styles' ? styles : voices)?.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3 justify-between hover:border-teal-light transition-colors">
            <div>
              <div className="flex justify-between mb-1">
                <h4 className="font-bold text-stone-800">{item.name}</h4>
                <span className="text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-600 uppercase">{tab === 'styles' ? item.story_type : item.voice_name}</span>
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
