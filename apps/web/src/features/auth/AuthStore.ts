import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { useReaderStore } from '../reader/store/useReaderStore';
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
    const syncUserProfilePrefs = (userId: string) => {
      supabase.from('profiles').select('reading_preferences, preferred_map_style').eq('id', userId).single()
        .then(({ data }) => {
          if (data?.reading_preferences && Object.keys(data.reading_preferences).length > 0) {
            useReaderStore.getState().syncPreferences(data.reading_preferences);
          }
          if (data?.preferred_map_style) {
            const norm = (data.preferred_map_style === 'lukisan' || data.preferred_map_style === 'B') ? 'lukisan' : 'kartun';
            localStorage.setItem('pln_map_style', norm);
          }
        });
    };

    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, session, isInitialized: true });
    if (session?.user) {
      syncUserProfilePrefs(session.user.id);
    }
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, session });
      if (session?.user) {
        syncUserProfilePrefs(session.user.id);
      }
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
  }
}));
