import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isInitialized: boolean;
  setUser: (user: User | null, session: Session | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  isInitialized: false,
  setUser: (user, session) => set({ user, session }),
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, session, isInitialized: true });
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, session });
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
  }
}));
