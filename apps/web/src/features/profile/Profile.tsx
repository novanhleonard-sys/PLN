import { useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { Button } from '../../ui/basic/Button';
import { SegmentedControl } from '../../ui/basic/SegmentedControl';
import { cn } from '../../utils/cn';

import { RiwayatBaca } from './RiwayatBaca';
import { Tersimpan } from './Tersimpan';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const displayName = user.user_metadata?.full_name || user.email || 'Pengguna';

  const tabs = [
    { label: 'Riwayat', path: '/profil/riwayat' },
    { label: 'Tersimpan', path: '/profil/tersimpan' },
    { label: 'Kontribusi saya', path: '/kontribusi/saya' },
    { label: 'Preferensi', path: '/profil/preferensi' },
  ];

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center">
      <div className="w-full max-w-4xl p-4 md:p-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-sea flex items-center justify-center text-white text-2xl font-fredoka font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-fredoka font-medium text-text-main">{displayName}</h1>
              <p className="text-sm font-nunito text-text-muted">{user.email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout} leftIcon="LogOut">
            Keluar
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-b border-border-light pb-4 overflow-x-auto">
          <SegmentedControl 
            options={tabs.map(t => t.label)} 
            value={tabs.find(t => location.pathname.startsWith(t.path) || (location.pathname === '/profil' && t.path === '/profil/riwayat'))?.label || tabs[0].label} 
            onChange={(val) => { const path = tabs.find(t => t.label === val)?.path; if (path) navigate(path); }} 
          />
        </div>

        {/* Content */}
        <div className="py-4">
          <Routes>
            <Route path="/" element={<RiwayatBaca />} />
            <Route path="/riwayat" element={<RiwayatBaca />} />
            <Route path="/tersimpan" element={<Tersimpan />} />
            <Route path="/preferensi" element={<div className="text-stone-500 font-nunito p-4">Preferensi akan tersedia segera.</div>} />
          </Routes>
        </div>

      </div>
    </div>
  );
}



