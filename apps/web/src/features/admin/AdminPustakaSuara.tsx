import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { FileUploader } from '../../ui/basic/FileUploader';
import { Toast } from '../../ui/basic/Toast';

export function AdminPustakaSuara() {
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  const formRef = useRef<HTMLDivElement>(null);

  const defaultForm = {
    id: undefined as string | undefined,
    name: '',
    audio_url: '',
    volume: 1.0,
    is_active: true,
    source: '',
    license: '',
    region: '',
    mood: '',
    story_type: '',
    region_group: ''
  };

  const [form, setForm] = useState(defaultForm);

  const fetchSounds = async () => {
    setLoading(true);
    const { data } = await supabase.from('ambient_sounds').select('*').order('created_at', { ascending: false });
    if (data) setSounds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  const getUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return supabase.storage.from('admin-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        audio_url: form.audio_url,
        volume: form.volume,
        is_active: form.is_active,
        source: form.source,
        license: form.license,
        region: form.region || null,
        mood: form.mood || null,
        story_type: form.story_type || null,
        region_group: form.region_group || null,
      };

      if (form.id) {
        await supabase.from('ambient_sounds').update(payload).eq('id', form.id);
        setToast('Berhasil memperbarui suara.');
      } else {
        await supabase.from('ambient_sounds').insert([payload]);
        setToast('Berhasil menambahkan suara.');
      }
      setForm(defaultForm);
      await fetchSounds();
    } catch (e) {
      setToast('Terjadi kesalahan saat menyimpan.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sound: any) => {
    setForm({
      ...sound,
      region: sound.region || '',
      mood: sound.mood || '',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus suara ini?')) return;
    await supabase.from('ambient_sounds').delete().eq('id', id);
    setToast('Suara berhasil dihapus.');
    await fetchSounds();
  };

  return (
    <div className="font-nunito max-w-5xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold font-fredoka text-stone-800">Pustaka Suara</h1>
          <p className="text-stone-500 text-sm mt-1">Kelola suara latar (ambient) untuk Mode Baca dan aturan kecocokannya.</p>
        </div>
      </div>

      <div ref={formRef} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">
        <h3 className="text-xl font-fredoka font-bold text-stone-800 mb-4">{form.id ? 'Edit Suara Latar' : 'Tambah Suara Latar'}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark md:col-span-2" 
            placeholder="Nama Suara (contoh: Angin Malam, Hutan Jati)" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
          />

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <select 
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" 
              value={form.story_type} 
              onChange={e => setForm({...form, story_type: e.target.value})}
            >
              <option value="">Semua Jenis Cerita</option>
              <option value="legenda">Legenda</option>
              <option value="mite">Mite</option>
              <option value="fabel">Fabel</option>
              <option value="dongeng">Dongeng</option>
            </select>
            <select 
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" 
              value={form.region_group || ''} 
              onChange={e => setForm({...form, region_group: e.target.value})}
            >
              <option value="">Daerah: Global</option>
              <option value="jawa">Jawa</option>
              <option value="sumatra">Sumatra</option>
              <option value="kalimantan">Kalimantan</option>
              <option value="sulawesi">Sulawesi</option>
              <option value="papua">Papua</option>
              <option value="nusa_bali">Nusa Tenggara & Bali</option>
              <option value="maluku">Maluku</option>
            </select>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark font-mono" 
              placeholder="Tag Spesifik Wilayah (opsional)" 
              value={form.region} 
              onChange={e => setForm({...form, region: e.target.value})} 
            />
            <input 
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark font-mono" 
              placeholder="Suasana/Mood (opsional)" 
              value={form.mood} 
              onChange={e => setForm({...form, mood: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-stone-700">File Audio Latar (.mp3/.ogg)</span>
              <div className="w-32">
                <FileUploader 
                  bucket="admin-assets" 
                  folder="ambient" 
                  accept="audio/*" 
                  label="Unggah" 
                  isAudio 
                  onUploadSuccess={p => setForm(s => ({...s, audio_url: getUrl(p[0])}))} 
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-bold shrink-0">Atau Tempel URL:</span>
              <input 
                className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm outline-none font-mono" 
                placeholder="https://..." 
                value={form.audio_url} 
                onChange={e => setForm({...form, audio_url: e.target.value})} 
              />
            </div>
            {form.audio_url && <audio controls className="w-full h-8 mt-2" src={form.audio_url} />}
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label className="block text-xs font-bold text-stone-500 mb-1">Volume Bawaan (0.1 - 2.0)</label>
              <input 
                type="number" 
                step="0.1" 
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" 
                value={form.volume} 
                onChange={e => setForm({...form, volume: Number(e.target.value)})} 
              />
            </div>
            <div className="flex items-center justify-end mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.is_active} 
                  onChange={e => setForm({...form, is_active: e.target.checked})} 
                  className="w-4 h-4 text-teal focus:ring-teal border-stone-300 rounded"
                />
                <span className="font-bold text-stone-700 text-sm">Aktif di Pustaka</span>
              </label>
            </div>
          </div>

          <input 
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" 
            placeholder="Sumber (opsional)" 
            value={form.source} 
            onChange={e => setForm({...form, source: e.target.value})} 
          />
          <input 
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-teal-dark" 
            placeholder="Lisensi (opsional)" 
            value={form.license} 
            onChange={e => setForm({...form, license: e.target.value})} 
          />

          <div className="md:col-span-2 flex gap-2 justify-end pt-2">
            {form.id && <Button variant="secondary" onClick={() => setForm(defaultForm)}>Batal</Button>}
            <Button disabled={!form.name || !form.audio_url || loading} onClick={handleSave}>
              {loading ? 'Menyimpan...' : (form.id ? 'Simpan' : 'Tambahkan')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {loading && sounds.length === 0 ? (
          <div className="animate-pulse text-stone-400 text-sm md:col-span-2 lg:col-span-3">Memuat pustaka...</div>
        ) : sounds.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-3 justify-between hover:border-teal-light transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-stone-800 line-clamp-1" title={item.name}>{item.name}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {item.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {item.story_type && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded uppercase">{item.story_type}</span>}
                {item.region_group && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded uppercase">{item.region_group}</span>}
                {item.region && <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded uppercase">{item.region}</span>}
                {item.mood && <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded uppercase">{item.mood}</span>}
              </div>
              {item.source && <p className="text-xs text-stone-500 line-clamp-1 mt-1 flex items-center gap-1"><Icon name="Link" size={10} /> {item.source}</p>}
            </div>
            
            <audio controls src={item.audio_url} className="w-full h-7 mb-1" />

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <Button className="flex-1 !py-1 !text-xs" variant="secondary" onClick={() => handleEdit(item)}>Edit</Button>
              <button className="px-2 text-stone-400 hover:text-red-500 transition-colors" onClick={() => handleDelete(item.id)}>
                <Icon name="Trash" size={14} />
              </button>
            </div>
          </div>
        ))}
        {sounds.length === 0 && !loading && (
          <div className="text-stone-500 text-sm md:col-span-2 lg:col-span-3 p-8 text-center bg-white rounded-2xl border border-stone-200 border-dashed">
            Belum ada suara di pustaka.
          </div>
        )}
      </div>

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
