import React from 'react';
import { useAuth } from '../features/auth/AuthStore';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/';

  React.useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + returnTo
      }
    });
  };

  return (
    <div className="flex h-screen items-center justify-center bg-cream font-nunito p-4 relative overflow-hidden">
      {/* Dekorasi awan latar belakang tipis */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="currentColor" className="text-teal">
          <path d="M30 60C13.4315 60 0 46.5685 0 30C0 14.1843 12.2359 1.22271 27.8184 0.116634C28.5303 0.0396001 29.2602 0 30 0C40.6385 0 50.0076 5.5323 55.3333 13.9141C58.1257 11.4429 61.8596 9.89474 65.9211 9.89474C72.8465 9.89474 78.749 14.2818 80.9856 20.4851C83.2106 18.2861 86.3861 16.9474 89.8684 16.9474C97.1352 16.9474 103.026 22.8383 103.026 30.1053C103.026 30.7099 102.985 31.3053 102.906 31.8906C112.56 34.0204 120 42.6622 120 52.9474C120 56.8436 116.844 60 112.947 60H30Z"/>
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none">
        <svg width="150" height="75" viewBox="0 0 120 60" fill="currentColor" className="text-coral">
          <path d="M30 60C13.4315 60 0 46.5685 0 30C0 14.1843 12.2359 1.22271 27.8184 0.116634C28.5303 0.0396001 29.2602 0 30 0C40.6385 0 50.0076 5.5323 55.3333 13.9141C58.1257 11.4429 61.8596 9.89474 65.9211 9.89474C72.8465 9.89474 78.749 14.2818 80.9856 20.4851C83.2106 18.2861 86.3861 16.9474 89.8684 16.9474C97.1352 16.9474 103.026 22.8383 103.026 30.1053C103.026 30.7099 102.985 31.3053 102.906 31.8906C112.56 34.0204 120 42.6622 120 52.9474C120 56.8436 116.844 60 112.947 60H30Z"/>
        </svg>
      </div>

      <div className="max-w-sm w-full bg-cream border-2 border-border-light rounded-[32px] shadow-warm-lg p-8 relative z-10 text-center">
        {/* Ikon buku kecil di atas */}
        <div className="mx-auto w-12 h-12 mb-4 text-coral opacity-80 flex justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold font-fredoka text-text-main mb-8 leading-tight">
          Masuk Ke Peta Legenda Nusantara
        </h1>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border-light text-text-main px-4 py-3 rounded-full font-bold hover:bg-stone-50 transition-colors shadow-sm mb-6"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </button>
        
        <Link to="/" className="text-sm font-semibold text-text-light hover:text-text-main underline decoration-2 underline-offset-4">
          Kembali ke peta
        </Link>
      </div>
    </div>
  );
};
