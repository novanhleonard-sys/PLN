import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';

export function AdminPengaturan() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  
  // Local state for forms
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      const parsed: Record<string, any> = {};
      data.forEach(d => { parsed[d.key] = d.value; });
      return parsed;
    }
  });

  useEffect(() => {
    if (dbSettings) {
      setLocalSettings(dbSettings);
    }
  }, [dbSettings]);

  const mutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase.from('app_settings').upsert({ key, value });
      if (error) throw error;
    },
    onMutate: ({ key }) => setSavingKey(key),
    onSettled: () => setSavingKey(null),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ['app_settings'] });
      setToast(`Pengaturan '${key}' berhasil disimpan.`);
    },
    onError: (e) => setToast(`Gagal menyimpan: ${e.message}`)
  });

  const handleSave = (key: string) => {
    mutation.mutate({ key, value: localSettings[key] });
  };

  const updateLocal = (key: string, field: string, val: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: val }
    }));
  };

  if (isLoading) return <div className="p-8 text-center font-nunito animate-pulse">Memuat pengaturan...</div>;

  return (
    <div className="flex flex-col gap-8 font-nunito max-w-4xl pb-12">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Pengaturan Sistem</h2>
        <p className="text-stone-500 text-sm mt-1">
          Perubahan pada pengaturan akan disimpan di database dan berlaku untuk antrean/job berikutnya.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Publikasi & Moderasi */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold font-fredoka text-lg text-stone-800">Publikasi & Moderasi</h3>
              <p className="text-sm text-stone-500">Aturan auto-publish dan ambang batas moderasi AI.</p>
            </div>
            <Button disabled={savingKey === 'moderation'} onClick={() => handleSave('moderation')}>
              {savingKey === 'moderation' ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Auto Publish</label>
              <select 
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['moderation']?.autoPublish ? 'true' : 'false'}
                onChange={(e) => updateLocal('moderation', 'autoPublish', e.target.value === 'true')}
              >
                <option value="true">Aktif (Langsung tayang jika lolos)</option>
                <option value="false">Mati (Wajib review admin)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Ambang Confidence AI (%)</label>
              <input type="number" min="0" max="100" 
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['moderation']?.confidenceThreshold || 80}
                onChange={(e) => updateLocal('moderation', 'confidenceThreshold', parseInt(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Produksi AI */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold font-fredoka text-lg text-stone-800">Produksi AI</h3>
              <p className="text-sm text-stone-500">Pengaturan eksekusi Job Runner dan model per tahapan.</p>
            </div>
            <Button disabled={savingKey === 'ai_production'} onClick={() => handleSave('ai_production')}>
              {savingKey === 'ai_production' ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Model Teks Utama</label>
              <input type="text"
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['ai_production']?.textModel || 'gemini-3.6-flash'}
                onChange={(e) => updateLocal('ai_production', 'textModel', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Model Gambar</label>
              <input type="text"
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['ai_production']?.imageModel || 'gemini-3.1-flash-image'}
                onChange={(e) => updateLocal('ai_production', 'imageModel', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Gaya Gambar Visual</label>
              <input type="text"
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['ai_production']?.imageStyle || 'kartun ramah anak'}
                onChange={(e) => updateLocal('ai_production', 'imageStyle', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Model Audio TTS</label>
              <input type="text"
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['ai_production']?.audioModel || 'gemini-2.5-flash-preview-tts'}
                onChange={(e) => updateLocal('ai_production', 'audioModel', e.target.value)}
              />
            </div>
          </div>
        </section>
        
        {/* Kontrol Biaya */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold font-fredoka text-lg text-stone-800">Batas Biaya Operasional</h3>
              <p className="text-sm text-stone-500">Membatasi eksekusi worker jika total pengeluaran melampaui limit (Soft Limit).</p>
            </div>
            <Button disabled={savingKey === 'cost_limits'} onClick={() => handleSave('cost_limits')}>
              {savingKey === 'cost_limits' ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-stone-700">Batas Harian (USD)</label>
              <input type="number" step="0.5" min="1" max="100"
                className="border border-stone-200 rounded-lg p-2 focus:border-teal outline-none"
                value={localSettings['cost_limits']?.dailyLimitUsd || 10}
                onChange={(e) => updateLocal('cost_limits', 'dailyLimitUsd', parseFloat(e.target.value))}
              />
              <p className="text-xs text-stone-400">Catatan: Limit di sini tidak mengubah Hard Limit (Plafon Keras) yang diatur di level Environment Server, melainkan menghentikan Job Runner.</p>
            </div>
          </div>
        </section>

      </div>

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
