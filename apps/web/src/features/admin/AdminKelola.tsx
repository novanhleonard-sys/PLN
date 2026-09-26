import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';
import { Modal } from '../../ui/layers/Modal';

export function AdminKelola() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  
  const [targetRevoke, setTargetRevoke] = useState<{id: string, name: string} | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Get current user id
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, display_name').eq('role', 'admin');
      if (error) throw error;
      return data;
    }
  });

  const callEdgeFunction = async (action: 'add' | 'remove', email?: string, profileId?: string) => {
    if (!session?.access_token) throw new Error("No session");
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage_admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, email, profileId })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal mengubah role admin");
    return data;
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      setAdding(true);
      await callEdgeFunction('add', newEmail.trim());
    },
    onSettled: () => setAdding(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setToast(`Berhasil menjadikan ${newEmail} sebagai admin.`);
      setNewEmail('');
    },
    onError: (e: any) => setToast(`Gagal: ${e.message}`)
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      setRevoking(true);
      if (!targetRevoke) return;
      await callEdgeFunction('remove', undefined, targetRevoke.id);
    },
    onSettled: () => setRevoking(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setToast(`Berhasil mencabut akses admin dari ${targetRevoke?.name}.`);
      setTargetRevoke(null);
    },
    onError: (e: any) => {
      setToast(`Gagal: ${e.message}`);
      setTargetRevoke(null);
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    addMutation.mutate();
  };

  if (isLoading) return <div className="p-8 font-nunito animate-pulse">Memuat daftar admin...</div>;

  return (
    <div className="flex flex-col gap-8 font-nunito max-w-3xl pb-12">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Kelola Admin</h2>
        <p className="text-stone-500 text-sm mt-1">
          Tambahkan atau cabut akses peran Admin. Akses Admin memungkinkan kontrol penuh terhadap sistem.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold font-fredoka text-lg text-stone-800 mb-4">Daftar Admin Saat Ini</h3>
        <div className="flex flex-col gap-3">
          {admins?.map((admin) => (
            <div key={admin.id} className="flex justify-between items-center p-3 border border-stone-100 bg-stone-50 rounded-xl">
              <div className="font-bold text-stone-700">{admin.display_name}</div>
              {session?.user.id !== admin.id && (
                <Button variant="ghost" className="!text-red-500 hover:!bg-red-50" onClick={() => setTargetRevoke({ id: admin.id, name: admin.display_name })}>
                  Cabut Akses
                </Button>
              )}
              {session?.user.id === admin.id && (
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider px-4">(Anda)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold font-fredoka text-lg text-stone-800 mb-2">Tambah Admin Baru</h3>
        <p className="text-sm text-stone-500 mb-6">Masukkan email yang sudah terdaftar dan terverifikasi di aplikasi.</p>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="email" 
            placeholder="email@example.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2 focus:border-teal outline-none"
            required
          />
          <Button type="submit" disabled={adding}>
            {adding ? 'Memproses...' : 'Jadikan Admin'}
          </Button>
        </form>
      </div>

      <Modal isOpen={!!targetRevoke} onClose={() => !revoking && setTargetRevoke(null)}>
        <div className="p-6 font-nunito">
          <h3 className="text-xl font-fredoka font-bold mb-4 text-stone-800">Cabut Akses Admin</h3>
          <p className="mb-6 text-stone-600">
            Apakah Anda yakin ingin mencabut akses admin dari <strong>{targetRevoke?.name}</strong>? Pengguna ini tidak akan bisa lagi mengakses pusat admin.
          </p>
          <div className="flex gap-4 justify-end">
            <Button variant="secondary" onClick={() => setTargetRevoke(null)} disabled={revoking}>Batal</Button>
            <Button className="!bg-red-600 hover:!bg-red-700" onClick={() => revokeMutation.mutate()} disabled={revoking}>
              {revoking ? 'Mencabut...' : 'Ya, Cabut Akses'}
            </Button>
          </div>
        </div>
      </Modal>

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
