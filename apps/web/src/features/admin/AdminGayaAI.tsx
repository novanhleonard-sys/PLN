import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { FileUploader } from '../../ui/basic/FileUploader';
import { Icon } from '../../ui/basic/Icon';

type StyleConfig = {
  id?: string;
  name: string;
  story_type: string;
  region_group: string | null;
  descriptor: string;
  palette: any;
  negative_prompt: string;
  reference_paths: string[];
};

export function AdminGayaAI() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'styles' | 'voices'>('styles');
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<StyleConfig>({
    name: '',
    story_type: 'legenda',
    region_group: '',
    descriptor: '',
    palette: { primary: '#D9663F' },
    negative_prompt: 'modern, text, watermark',
    reference_paths: []
  });

  const { data: styles, isLoading } = useQuery({
    queryKey: ['admin_styles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('style_configs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: tab === 'styles'
  });

  const { data: voices, isLoading: loadingVoices } = useQuery({
    queryKey: ['admin_voices'],
    queryFn: async () => {
      const { data, error } = await supabase.from('voice_personas').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: tab === 'voices'
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: StyleConfig) => {
      const dbPayload = {
        name: payload.name,
        story_type: payload.story_type,
        region_group: payload.region_group || null,
        descriptor: payload.descriptor,
        palette: payload.palette,
        negative_prompt: payload.negative_prompt,
        reference_paths: payload.reference_paths
      };
      if (payload.id) {
        const { error } = await supabase.from('style_configs').update(dbPayload).eq('id', payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('style_configs').insert(dbPayload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setToast('Gaya berhasil disimpan.');
      queryClient.invalidateQueries({ queryKey: ['admin_styles'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('style_configs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Gaya dihapus.');
      queryClient.invalidateQueries({ queryKey: ['admin_styles'] });
    }
  });

  const updateVoiceSample = useMutation({
    mutationFn: async ({ id, path }: { id: string, path: string }) => {
      const { error } = await supabase.from('voice_personas').update({ sample_path: path }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Sampel suara berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: ['admin_voices'] });
    }
  });

  const resetForm = () => {
    setForm({
      name: '',
      story_type: 'legenda',
      region_group: '',
      descriptor: '',
      palette: { primary: '#D9663F' },
      negative_prompt: 'modern, text, watermark',
      reference_paths: []
    });
  };

  const handleEdit = (item: any) => {
    setForm({
      id: item.id,
      name: item.name || '',
      story_type: item.story_type,
      region_group: item.region_group || '',
      descriptor: item.descriptor,
      palette: item.palette,
      negative_prompt: item.negative_prompt,
      reference_paths: item.reference_paths || (item.anchor_image_path ? [item.anchor_image_path] : [])
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const removeReference = (index: number) => {
    setForm(prev => ({
      ...prev,
      reference_paths: prev.reference_paths.filter((_, i) => i !== index)
    }));
  };

  const getStorageUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/admin-assets/${path}`;

  return (
    <div className="flex flex-col gap-10 font-nunito pb-12 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Gaya AI & Referensi</h2>
        <p className="text-stone-500 text-sm mt-1">
          Atur parameter visual dan suara untuk generasi AI. Anda dapat mengunggah referensi (Few-Shot) untuk mengarahkan Worker AI.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
        <button 
          onClick={() => setTab('styles')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'styles' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
        >
          Gaya Visual
        </button>
        <button 
          onClick={() => setTab('voices')}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'voices' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
        >
          Persona Suara
        </button>
      </div>

      {tab === 'styles' && (
        <>
          {/* FORM SECTION */}
          <div ref={formRef} className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
            <h2 className="text-2xl font-fredoka font-bold text-stone-800 mb-6">
              {form.id ? 'Edit Gaya AI' : 'Buat Gaya Baru'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-stone-700">Nama Gaya</label>
                <input 
                  className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-teal-dark"
                  placeholder="Contoh: Gaya Wayang Kuno"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-stone-700">Warna Utama (Palette)</label>
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
                  <input 
                    type="color"
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                    value={form.palette?.primary || '#000000'}
                    onChange={e => setForm({...form, palette: { primary: e.target.value }})}
                  />
                  <span className="text-stone-500 font-mono text-sm">{form.palette?.primary}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-stone-700">Teks Prompt (Descriptor)</label>
                <textarea 
                  className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-teal-dark min-h-[100px]"
                  placeholder="Instruksi spesifik untuk model AI (misal: gaya lukisan cat minyak klasik...)"
                  value={form.descriptor}
                  onChange={e => setForm({...form, descriptor: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-stone-700">Parameter: Tipe Cerita</label>
                <select 
                  className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  value={form.story_type}
                  onChange={e => setForm({...form, story_type: e.target.value})}
                >
                  <option value="legenda">Legenda</option>
                  <option value="mite">Mite</option>
                  <option value="fabel">Fabel</option>
                  <option value="dongeng">Dongeng</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-stone-700">Parameter: Daerah (Opsional)</label>
                <select 
                  className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  value={form.region_group || ''}
                  onChange={e => setForm({...form, region_group: e.target.value})}
                >
                  <option value="">Semua Daerah (Global)</option>
                  <option value="jawa">Jawa</option>
                  <option value="sumatra">Sumatra</option>
                  <option value="kalimantan">Kalimantan</option>
                  <option value="sulawesi">Sulawesi</option>
                  <option value="papua">Papua</option>
                  <option value="nusa_bali">Nusa Tenggara & Bali</option>
                  <option value="maluku">Maluku</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2 bg-stone-50 p-5 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-stone-700">Gambar Referensi (Few-Shot)</label>
                  <div className="w-48">
                    <FileUploader 
                      bucket="admin-assets"
                      folder="styles"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      label="Tambah Gambar"
                      onUploadSuccess={(paths) => {
                        setForm(prev => ({ ...prev, reference_paths: [...prev.reference_paths, ...paths] }));
                      }}
                    />
                  </div>
                </div>
                
                {form.reference_paths.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {form.reference_paths.map((path, idx) => (
                      <div key={idx} className="relative group shrink-0">
                        <img src={getStorageUrl(path)} alt="Ref" className="w-24 h-24 object-cover rounded-xl border border-stone-200 shadow-sm" />
                        <button 
                          onClick={() => removeReference(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-stone-400 text-sm py-4 border-2 border-dashed border-stone-200 rounded-xl">
                    Belum ada referensi yang ditambahkan.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100 justify-end">
              {form.id && (
                <Button variant="secondary" onClick={resetForm}>Batal Edit</Button>
              )}
              <Button 
                disabled={!form.name || !form.descriptor || saveMutation.isPending} 
                onClick={() => saveMutation.mutate(form)}
              >
                {saveMutation.isPending ? 'Menyimpan...' : (form.id ? 'Simpan Perubahan' : 'Buat Gaya')}
              </Button>
            </div>
          </div>

          {/* LIST SECTION */}
          <div>
            <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-4">Daftar Gaya Terdaftar</h3>
            {isLoading ? (
              <div className="animate-pulse text-stone-500">Memuat data...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {styles?.map(item => {
                  const refs = item.reference_paths || (item.anchor_image_path ? [item.anchor_image_path] : []);
                  return (
                    <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-teal-light transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-stone-800 text-lg">{item.name || `Gaya ${item.story_type}`}</h4>
                          <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: item.palette?.primary }} />
                        </div>
                        <div className="flex gap-2 mb-4">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs uppercase">{item.story_type}</span>
                          {item.region_group && <span className="px-2 py-0.5 bg-teal-50 text-teal-dark rounded text-xs uppercase">{item.region_group}</span>}
                        </div>
                        <p className="text-sm text-stone-600 line-clamp-2 mb-4">{item.descriptor}</p>
                        
                        {refs.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {refs.slice(0, 4).map((p: string, i: number) => (
                              <img key={i} src={getStorageUrl(p)} className="w-10 h-10 object-cover rounded-md border border-stone-200" />
                            ))}
                            {refs.length > 4 && <div className="w-10 h-10 bg-stone-100 rounded-md flex items-center justify-center text-xs font-bold text-stone-500">+{refs.length - 4}</div>}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-4 border-t border-stone-100">
                        <Button className="flex-1" variant="secondary" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <button 
                          className="px-4 py-2 text-stone-400 hover:text-red-500 transition-colors"
                          onClick={() => {
                            if (confirm('Yakin ingin menghapus gaya ini?')) deleteMutation.mutate(item.id);
                          }}
                        >
                          <Icon name="Trash" size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'voices' && (
        <div className="grid gap-6 md:grid-cols-2">
          {loadingVoices ? <div className="animate-pulse text-stone-500">Memuat suara...</div> : voices?.map(voice => (
            <div key={voice.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{voice.name}</h3>
                <p className="text-xs text-stone-500 mt-1">ID Model: <code className="bg-stone-100 px-1 py-0.5 rounded text-teal-dark">{voice.voice_name}</code></p>
                <p className="text-sm text-stone-700 mt-2 italic">"{voice.style_prompt}"</p>
              </div>
              
              <div className="mt-2 bg-stone-50 rounded-xl p-3 border border-stone-100 flex flex-col gap-3">
                <p className="text-xs font-bold text-stone-700">Sampel Suara (Preview)</p>
                {voice.sample_path ? (
                  <audio controls className="w-full h-8" src={getStorageUrl(voice.sample_path)} />
                ) : (
                  <div className="text-xs text-stone-400 italic">Belum ada sampel audio.</div>
                )}
                <FileUploader 
                  bucket="admin-assets"
                  folder="voices"
                  accept="audio/mpeg,audio/wav"
                  label="Unggah MP3"
                  isAudio
                  onUploadSuccess={(paths) => updateVoiceSample.mutate({ id: voice.id, path: paths[0] })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
