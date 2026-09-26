import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';

export const AdminPustakaSuara: React.FC = () => {
  const [sounds, setSounds] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  const fetchSounds = async () => {
    setLoading(true);
    const { data } = await supabase.from('ambient_sounds').select('*').order('created_at', { ascending: false });
    if (data) setSounds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-fredoka">Pustaka Suara</h1>
          <p className="text-stone-500">Kelola suara latar untuk Mode Baca.</p>
        </div>
        <Button variant="primary">Tambah Suara</Button>
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
                  <td className="p-4 text-sm text-stone-500">{sound.source || '-'}</td>
                  <td className="p-4 text-right">
                    <Button variant="secondary" size="sm" className="!p-2">
                      <Icon name="Settings2" size={16} />
                    </Button>
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
