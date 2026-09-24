import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthStore';
import { supabase } from '../../lib/supabase';

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        try {
          const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          setIsAdmin(data?.role === 'admin');
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  if (isAdmin === null) return <div className="p-8 text-center text-text-muted">Memeriksa akses...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
