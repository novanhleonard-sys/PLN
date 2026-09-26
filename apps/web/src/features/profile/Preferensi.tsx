import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Button } from '../../ui/basic/Button';
import { useReaderStore } from '../reader/store/useReaderStore';
import { Modal } from '../../ui/layers/Modal';
import { useNavigate } from 'react-router-dom';

export function Preferensi({ activeTab = 'preferensi' }: { activeTab?: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mapStyle, setMapStyle] = useState('kartun');
  const { globalPrefs, updateGlobal } = useReaderStore();
  const [loadingMap, setLoadingMap] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadPref = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('preferred_map_style').eq('id', user.id).single();
      if (data?.preferred_map_style) {
        setMapStyle(data.preferred_map_style);
        localStorage.setItem('pln_map_style', data.preferred_map_style);
      }
    };
    loadPref();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'hapus-akun') {
      setShowDeleteModal(true);
    } else {
      setShowDeleteModal(false);
    }
  }, [activeTab]);

  const updateMapStyle = async (style: string) => {
    setMapStyle(style);
    localStorage.setItem('pln_map_style', style);
    if (!user) return;
    setLoadingMap(true);
    await supabase.from('profiles').update({ preferred_map_style: style }).eq('id', user.id);
    setLoadingMap(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete_account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menghapus akun');
      }

      await signOut();
      navigate('/');
    } catch (e: any) {
      setDeleteError(e.message || 'Terjadi kesalahan saat menghapus akun');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 font-nunito max-w-2xl">
      
      {activeTab !== 'hapus-akun' && (
        <>
          <h2 className="text-2xl font-fredoka font-bold text-stone-800">Preferensi</h2>

          <section>
            <h3 className="text-lg font-fredoka font-bold mb-4 text-stone-700">Gaya Peta Bawaan</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="ghost" 
                disabled={loadingMap}
                onClick={() => updateMapStyle('kartun')}
                className={`flex flex-col items-center gap-2 p-2 border-2 rounded-2xl transition-all ${mapStyle === 'kartun' ? 'border-teal bg-teal/10' : 'border-stone-200 bg-white hover:border-teal/50'}`}
              >
                <div className="w-full aspect-video bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                  <span className="text-stone-400 font-semibold text-xs uppercase tracking-wider">Thumbnail Kartun</span>
                </div>
                <span className={`font-semibold ${mapStyle === 'kartun' ? 'text-teal' : 'text-stone-700'}`}>Kartun</span>
              </Button>
              
              <Button variant="ghost" 
                disabled={loadingMap}
                onClick={() => updateMapStyle('lukisan')}
                className={`flex flex-col items-center gap-2 p-2 border-2 rounded-2xl transition-all ${mapStyle === 'lukisan' ? 'border-teal bg-teal/10' : 'border-stone-200 bg-white hover:border-teal/50'}`}
              >
                <div className="w-full aspect-video bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
                   <span className="text-stone-400 font-semibold text-xs uppercase tracking-wider">Thumbnail Lukisan</span>
                </div>
                <span className={`font-semibold ${mapStyle === 'lukisan' ? 'text-teal' : 'text-stone-700'}`}>Lukisan</span>
              </Button>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-fredoka font-bold text-stone-700 border-b border-stone-200 pb-2">Pengalaman Membaca</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800">Ukuran Teks</div>
                <div className="text-sm text-stone-500">Sesuaikan besarnya teks saat membaca cerita</div>
              </div>
              <select value={globalPrefs.fontSizeBaca} onChange={(e) => updateGlobal({ fontSizeBaca: e.target.value as any })} className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal">
                <option value="small">Kecil</option>
                <option value="normal">Sedang</option>
                <option value="large">Besar</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800">Kecepatan Narasi</div>
                <div className="text-sm text-stone-500">Atur kecepatan pembacaan audio dongeng</div>
              </div>
              <select value={globalPrefs.dongengSpeed} onChange={(e) => updateGlobal({ dongengSpeed: Number(e.target.value) })} className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal">
                <option value={0.75}>0.75x</option>
                <option value={1}>1x (Normal)</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-stone-800">Kurangi Animasi</div>
                <div className="text-sm text-stone-500">Matikan efek gerak berlebih pada antarmuka</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
              </label>
            </div>
          </section>
        </>
      )}

      {activeTab === 'hapus-akun' && (
        <section>
          <h2 className="text-2xl font-fredoka font-bold text-red-600 mb-2">Hapus Akun</h2>
          <p className="text-stone-500 mb-6">Kamu memilih untuk menghapus akun. Mohon baca peringatan di bawah ini sebelum melanjutkan.</p>
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
            <h3 className="font-bold text-red-800 mb-2">Peringatan Kritis</h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              <li>Semua data profil, poin, dan preferensi akan dihapus secara permanen.</li>
              <li>Cerita yang kamu simpan (Tersimpan) dan riwayat bacamu (Riwayat) akan hilang.</li>
              <li>Kontribusi cerita yang sudah disetujui akan tetap ada, namun nama penulis akan disamarkan.</li>
              <li>Tindakan ini <strong>tidak dapat dibatalkan</strong>!</li>
            </ul>
          </div>
          <Button variant="secondary" className="!text-red-600 !border-red-600 hover:!bg-red-50" onClick={() => setShowDeleteModal(true)}>
            Lanjutkan Hapus Akun
          </Button>
        </section>
      )}

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false);
          if (activeTab === 'hapus-akun') navigate('#preferensi');
        }}
      >
        <div className="p-6 font-nunito">
          <h3 className="text-xl font-fredoka font-bold mb-4 text-stone-800">Konfirmasi Final Hapus Akun</h3>
          <p className="mb-6 text-stone-600">Apakah kamu sangat yakin ingin menghapus akun secara permanen? Sekali dihapus, akun tidak akan pernah bisa dikembalikan.</p>
          
          {deleteError && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {deleteError}
            </div>
          )}

          <div className="flex gap-4 justify-end mt-4">
            <Button variant="secondary" onClick={() => {
              setShowDeleteModal(false);
              if (activeTab === 'hapus-akun') navigate('#preferensi');
            }} disabled={deleting}>
              Batal
            </Button>
            <Button onClick={handleDeleteAccount} disabled={deleting} className="!bg-red-600 hover:!bg-red-700 text-white">
              {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
