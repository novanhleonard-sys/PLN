import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Button } from '../../ui/basic/Button';

import { Modal } from '../../ui/layers/Modal';
import { useNavigate } from 'react-router-dom';

export function Preferensi() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mapStyle, setMapStyle] = useState('kartun');
  const [loadingMap, setLoadingMap] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Load from DB
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
    <div className="flex flex-col gap-8 max-w-2xl mx-auto font-nunito">
      
      <section>
        <h2 className="text-xl font-fredoka font-semibold mb-4 text-text-main">Gaya peta default</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={loadingMap}
            onClick={() => updateMapStyle('kartun')}
            className={`flex flex-col items-center gap-2 p-2 border-2 rounded-2xl transition-all ${mapStyle === 'kartun' ? 'border-primary-teal bg-primary-teal/10' : 'border-border-light bg-white hover:border-primary-teal/50'}`}
          >
            <div className="w-full aspect-video bg-stone-200 rounded-xl overflow-hidden flex items-center justify-center">
              <span className="text-stone-400 font-semibold">Thumbnail Kartun</span>
            </div>
            <span className={`font-semibold ${mapStyle === 'kartun' ? 'text-primary-teal' : 'text-text-main'}`}>Kartun</span>
          </button>
          
          <button 
            disabled={loadingMap}
            onClick={() => updateMapStyle('lukisan')}
            className={`flex flex-col items-center gap-2 p-2 border-2 rounded-2xl transition-all ${mapStyle === 'lukisan' ? 'border-primary-teal bg-primary-teal/10' : 'border-border-light bg-white hover:border-primary-teal/50'}`}
          >
            <div className="w-full aspect-video bg-stone-200 rounded-xl overflow-hidden flex items-center justify-center">
               <span className="text-stone-400 font-semibold">Thumbnail Lukisan</span>
            </div>
            <span className={`font-semibold ${mapStyle === 'lukisan' ? 'text-primary-teal' : 'text-text-main'}`}>Lukisan</span>
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-fredoka font-semibold mb-4 text-text-main">Akun</h2>
        <div className="flex flex-col gap-2 bg-white rounded-xl border border-border-light p-4">
          <a href="#" className="text-primary-teal hover:underline font-semibold">Ketentuan dan Kebijakan Privasi</a>
        </div>
      </section>

      <section className="pt-8 border-t border-red-200">
        <h2 className="text-xl font-fredoka font-semibold mb-2 text-status-error">Hapus akun</h2>
        <p className="text-text-muted mb-4">Semua simpanan dan riwayat baca akan dihapus. Cerita yang kamu sumbangkan tetap tampil tanpa nama.</p>
        <Button variant="secondary" className="!text-status-error !border-status-error hover:!bg-status-error/10" onClick={() => setShowDeleteModal(true)}>
          Hapus akun
        </Button>
      </section>

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        
      >
        <div className="p-6">
          <h3 className="text-xl font-fredoka font-semibold mb-4 text-text-main">Konfirmasi Hapus Akun</h3>
          <p className="mb-6 text-text-main">Apakah kamu yakin ingin menghapus akun secara permanen? Tindakan ini tidak dapat dibatalkan.</p>
          
          {deleteError && (
            <div className="p-3 mb-4 text-sm text-status-error bg-status-error/10 rounded-lg">
              {deleteError}
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Batal
            </Button>
            <Button onClick={handleDeleteAccount} disabled={deleting} className="!bg-status-error hover:!bg-red-700">
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
