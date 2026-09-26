import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { SidebarLayout } from '../../ui/layout/SidebarLayout';
import type { SidebarItem } from '../../ui/layout/SidebarLayout';
import { supabase } from '../../lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      navigate('/', { replace: true });
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (data?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/', { replace: true });
      }
    };
    
    checkAdmin();
  }, [user, isInitialized, navigate]);

  if (!isInitialized || isAdmin === null) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center pt-20">
        <div className="text-stone-500 font-nunito animate-pulse">Memverifikasi sesi...</div>
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // Will redirect
  }

  const activeId = location.pathname.split('/').pop() || 'dashboard';

  const menu: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Activity', onClick: () => navigate('/admin/dashboard') },
    { id: 'antrean', label: 'Antrean', icon: 'ListOrdered', onClick: () => navigate('/admin/antrean') },
    { id: 'konten', label: 'Konten', icon: 'Library', onClick: () => navigate('/admin/konten') },
    { id: 'gaya-ai', label: 'Gaya AI', icon: 'Sparkles', onClick: () => navigate('/admin/gaya-ai') },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'Settings', onClick: () => navigate('/admin/pengaturan') },
    { id: 'kelola', label: 'Kelola Admin', icon: 'Shield', onClick: () => navigate('/admin/kelola') },
    { id: 'kembali', label: 'Tutup Admin', icon: 'LogOut', isDanger: true, onClick: () => navigate('/') },
  ];

  return (
    <SidebarLayout title="Pusat Admin" items={menu} activeId={activeId}>
      {children}
    </SidebarLayout>
  );
}
