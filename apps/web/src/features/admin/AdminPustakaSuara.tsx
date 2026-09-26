import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';


export const AdminPustakaSuara: React.FC = () => {
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentSound, setCurrentSound] = useState<any>({});

  const fetchSounds = async () => {
    setLoading(true);
    const { data } = await supabase.from('ambient_sounds').select('*').order('created_at', { ascending: false });
    if (data) setSounds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    if (currentSound.id) {
      await supabase.from('ambient_sounds').update(currentSound).eq('id', currentSound.id);
    } else {
      await supabase.from('ambient_sounds').insert([currentSound]);
    }
    await fetchSounds();
    setIsEditing(false);
    setLoading(false);
  };

  const handleEdit = (sound: any) => {
    setCurrentSound(sound);
    setIsEditing(true);
  };

  const handleNew = () => {
    setCurrentSound({
      name: '',
      audio_url: '',
      volume: 1.0,
      is_active: true,
      source: '',
      license: ''
    });
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="p-6 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-fredoka">{currentSound.id ? 'Edit Suara' : 'Tambah Suara'}</h1>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Kembali</Button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nama Suara</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2" 
              value={currentSound.name || ''} 
              onChange={e => setCurrentSound({...currentSound, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">URL Audio (.mp3/.ogg)</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2" 
              value={currentSound.audio_url || ''} 
              onChange={e => setCurrentSound({...currentSound, audio_url: e.target.value})} 
            />
            {currentSound.audio_url && (
              <audio controls src={currentSound.audio_url} className="mt-2 h-8 w-full" />
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Volume (0.1 - 2.0)</label>
              <input 
                type="number" 
                step="0.1" 
                className="w-full border rounded-lg p-2" 
                value={currentSound.volume || 1} 
                onChange={e => setCurrentSound({...currentSound, volume: Number(e.target.value)})} 
              />
            </div>
            <div className="flex items-end mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={currentSound.is_active || false} 
                  onChange={e => setCurrentSound({...currentSound, is_active: e.target.checked})} 
                />
                <span className="font-bold">Aktif</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Sumber</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2" 
              value={currentSound.source || ''} 
              onChange={e => setCurrentSound({...currentSound, source: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Lisensi</label>
            <input 
              type="text" 
              className="w-full border rounded-lg p-2" 
              value={currentSound.license || ''} 
              onChange={e => setCurrentSound({...currentSound, license: e.target.value})} 
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Suara'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-fredoka">Pustaka Suara</h1>
          <p className="text-stone-500">Kelola suara latar untuk Mode Baca.</p>
        </div>
        <Button variant="primary" onClick={handleNew}>Tambah Suara</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Nama Suara</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Preview</th>
              <th className="p-4 font-semibold">Sumber</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sounds.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">
                  Belum ada suara di pustaka.
                </td>
              </tr>
            ) : (
              sounds.map((sound) => (
                <tr key={sound.id} className="hover:bg-stone-50">
                  <td className="p-4 font-medium">{sound.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${sound.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                      {sound.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4">
                    <audio controls src={sound.audio_url} className="h-8 w-40" />
                  </td>
                  <td className="p-4 text-sm text-stone-500">
                    {sound.source} <br/>
                    <span className="text-xs">{sound.license}</span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(sound)}>Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
