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
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user || null, session, isInitialized: true });
    if (session?.user) {
      supabase.from('profiles').select('reading_preferences').eq('id', session.user.id).single()
        .then(({ data }) => {
           if (data && data.reading_preferences && Object.keys(data.reading_preferences).length > 0) {
             useReaderStore.getState().syncPreferences(data.reading_preferences);
           }
        });
    }
    if (session?.user) { supabase.from('profiles').select('preferred_map_style').eq('id', session.user.id).single().then(({ data }) => { if (data?.preferred_map_style) localStorage.setItem('pln_map_style', data.preferred_map_style); }); }
    
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null, session });
      if (session?.user) { supabase.from('profiles').select('preferred_map_style').eq('id', session.user.id).single().then(({ data }) => { if (data?.preferred_map_style) localStorage.setItem('pln_map_style', data.preferred_map_style); }); }
    });
  },
  signOut: async () => {
    await supabase.auth.signOut();
  }
}));
