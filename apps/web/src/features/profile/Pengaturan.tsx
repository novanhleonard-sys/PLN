import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { SidebarLayout, SidebarItem } from '../../ui/layout/SidebarLayout';
import { Preferensi } from './Preferensi';

export function Pengaturan() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hash = location.hash.replace('#', '') || 'preferensi';
  
  useEffect(() => {
    if (!user) {
      navigate('/masuk', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menu: SidebarItem[] = [
    { id: 'preferensi', label: 'Preferensi', icon: 'Settings', onClick: () => navigate('#preferensi') },
    { id: 'logout', label: 'Logout', icon: 'LogOut', onClick: handleLogout },
    { id: 'hapus-akun', label: 'Hapus akun', icon: 'Trash2', isDanger: true, onClick: () => navigate('#hapus-akun') },
  ];

  return (
    <SidebarLayout title="Pengaturan" items={menu} activeId={hash}>
      {/* We will refactor Preferensi to handle both preferensi and hapus-akun hashes, or just use Preferensi component which handles both internally right now? Wait, the user specifically requested them to be separate menu items on the sidebar! */}
      <Preferensi activeTab={hash} />
    </SidebarLayout>
  );
}
