import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthStore';
import { supabase } from '../../lib/supabase';

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  if (isAdmin === null) return <div className="p-8 text-center text-text-muted">Memeriksa akses...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
