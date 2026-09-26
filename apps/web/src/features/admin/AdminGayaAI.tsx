import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { FileUploader } from '../../ui/basic/FileUploader';

export function AdminGayaAI() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'styles' | 'voices'>('styles');

  const { data: styles, isLoading: loadingStyles } = useQuery({
    queryKey: ['admin_styles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('style_configs').select('*').order('created_at', { ascending: true });
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

  const updateStyleImage = useMutation({
    mutationFn: async ({ id, path }: { id: string, path: string }) => {
      const { error } = await supabase.from('style_configs').update({ anchor_image_path: path }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Gambar acuan gaya berhasil diperbarui.');
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

  const getStorageUrl = (path: string) => {
    if (!path) return null;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${path}`;
  };

  return (
    <div className="flex flex-col gap-8 font-nunito pb-12 max-w-5xl">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Gaya AI & Referensi</h2>
        <p className="text-stone-500 text-sm mt-1">
          Atur parameter visual dan suara untuk generasi AI. Anda dapat mengunggah referensi (Few-Shot) untuk mengarahkan *Worker AI*.
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
        <div className="grid gap-6 md:grid-cols-2">
          {loadingStyles ? <div className="animate-pulse text-stone-500">Memuat gaya...</div> : styles?.map(style => (
            <div key={style.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold font-fredoka text-lg text-stone-800 uppercase">{style.story_type}</h3>
                  <p className="text-xs text-stone-500 mt-1">{style.descriptor}</p>
                </div>
                <div className="w-6 h-6 rounded-full border border-stone-200" style={{ backgroundColor: style.palette?.primary }} title="Warna Utama" />
              </div>
              
              <div className="mt-2 bg-stone-50 rounded-xl p-3 border border-stone-100 flex gap-4 items-center">
                {style.anchor_image_path ? (
                  <img src={getStorageUrl(`admin-assets/${style.anchor_image_path}`) || ''} alt="Acuan" className="w-20 h-20 object-cover rounded-lg shadow-sm" />
                ) : (
                  <div className="w-20 h-20 bg-stone-200 rounded-lg flex items-center justify-center text-xs text-stone-400 text-center p-2">Belum ada acuan</div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-stone-700 mb-2">Gambar Acuan (Reference)</p>
                  <FileUploader 
                    bucket="admin-assets"
                    folder="styles"
                    accept="image/jpeg,image/png,image/webp"
                    label="Unggah Acuan"
                    onUploadSuccess={(path) => updateStyleImage.mutate({ id: style.id, path: path })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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
                  <audio controls className="w-full h-8" src={getStorageUrl(`admin-assets/${voice.sample_path}`) || ''} />
                ) : (
                  <div className="text-xs text-stone-400 italic">Belum ada sampel audio.</div>
                )}
                <FileUploader 
                  bucket="admin-assets"
                  folder="voices"
                  accept="audio/mpeg,audio/wav"
                  label="Unggah MP3"
                  isAudio
                  onUploadSuccess={(path) => updateVoiceSample.mutate({ id: voice.id, path: path })}
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
