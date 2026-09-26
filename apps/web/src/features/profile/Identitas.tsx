import { useState } from 'react';
import { useAuth } from '../auth/AuthStore';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Input } from '../../ui/basic/Input';

export function Identitas() {
  const { user, initialize } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const avatar = user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + user?.id;

  const handleSave = async () => {
    setIsSaving(true);
    setMsg('');
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name }
    });
    // also update profiles table
    if (!error && user) {
       await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
       await initialize();
       setMsg('Profil berhasil diperbarui!');
    } else {
       setMsg('Gagal memperbarui profil.');
    }
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 font-nunito max-w-md">
      <h2 className="text-2xl font-fredoka font-bold text-stone-800">Identitas</h2>
      
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cream shadow-sm shrink-0">
          <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm text-stone-500 mb-2">Foto profil diambil dari Google (gravatar). Saat ini belum bisa diubah langsung.</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 mt-2">
        <Input 
          label="Nama Lengkap" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Masukkan nama"
        />
        <Input 
          label="Email" 
          value={user.email || ''} 
          disabled 
          className="bg-stone-50 text-stone-500"
        />
      </div>
      
      {msg && <p className="text-sm font-bold text-teal">{msg}</p>}

      <div className="mt-4">
        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}
