import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthStore';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/masuk', { state: { returnTo: location.pathname } });
    }
  }, [user, isInitialized, navigate, location]);

  if (!isInitialized || !user) {
    return <div className="flex h-screen items-center justify-center p-4"><p className="text-stone-500">Memeriksa sesi...</p></div>;
  }

  return <>{children}</>;
};
