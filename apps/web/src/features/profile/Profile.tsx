import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { SidebarLayout, SidebarItem } from '../../ui/layout/SidebarLayout';

import { Identitas } from './Identitas';
import { Poin } from './Poin';
import { Lanjutkan } from './Lanjutkan';
import { Tersimpan } from './Tersimpan';
import { Riwayat } from './Riwayat';
import { Kontribusiku } from './Kontribusiku';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hash = location.hash.replace('#', '') || 'identitas';
  
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
    { id: 'identitas', label: 'Identitas', icon: 'User', onClick: () => navigate('#identitas') },
    { id: 'poin', label: 'Poin', icon: 'Award', onClick: () => navigate('#poin') },
    { id: 'lanjutkan', label: 'Lanjutkan', icon: 'PlayCircle', onClick: () => navigate('#lanjutkan') },
    { id: 'tersimpan', label: 'Tersimpan', icon: 'Bookmark', onClick: () => navigate('#tersimpan') },
    { id: 'riwayat', label: 'Riwayat', icon: 'CheckCircle', onClick: () => navigate('#riwayat') },
    { id: 'kontribusiku', label: 'Kontribusiku', icon: 'PenTool', onClick: () => navigate('#kontribusiku') },
    { id: 'logout', label: 'Logout', icon: 'LogOut', isDanger: true, onClick: handleLogout },
  ];

  const renderContent = () => {
    switch (hash) {
      case 'identitas': return <Identitas />;
      case 'poin': return <Poin />;
      case 'lanjutkan': return <Lanjutkan />;
      case 'tersimpan': return <Tersimpan />;
      case 'riwayat': return <Riwayat />;
      case 'kontribusiku': return <Kontribusiku />;
      default: return <Identitas />;
    }
  };

  return (
    <SidebarLayout title="Profil" items={menu} activeId={hash}>
      {renderContent()}
    </SidebarLayout>
  );
}
