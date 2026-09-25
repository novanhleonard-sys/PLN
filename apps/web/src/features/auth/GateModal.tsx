import React from 'react';
import { useAuth } from './AuthStore';
import { supabase } from '../../lib/supabase';
import { useLocation } from 'react-router-dom';
import { Sheet } from '../../ui/layers/Sheet';
import { Modal } from '../../ui/layers/Modal';
import { Button } from '../../ui/basic/Button';
import { useMediaQuery } from '../../utils/useMediaQuery';

interface GateModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  returnTo?: string;
}

export const GateModal: React.FC<GateModalProps> = ({ isOpen, onClose, message, returnTo }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const redirectPath = returnTo || location.pathname;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + redirectPath
      }
    });
  };

  const content = (
    <div className="p-6 md:p-8 text-center">
      <div className="mx-auto w-12 h-12 mb-4 text-coral opacity-80 flex justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold font-fredoka text-text-main mb-2">Masuk Ke Peta Legenda Nusantara</h2>
      <p className="text-text-muted mb-6 font-nunito">{message || 'Masuk untuk melanjutkan.'}</p>
      
      <Button variant="secondary" onClick={handleGoogleLogin} className="w-full gap-3 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Lanjutkan dengan Google
      </Button>
      
      {!isDesktop && (
        <Button variant="text" size="sm" onClick={onClose}>Nanti saja</Button>
      )}
    </div>
  );

  if (!isOpen || user) return null;

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        {content}
      </Modal>
    );
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      {content}
    </Sheet>
  );
};

