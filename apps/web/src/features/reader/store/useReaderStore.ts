import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../../lib/supabase';

export type ReaderTheme = 'terang' | 'hangat' | 'gelap';
export type FontSize = 'small' | 'normal' | 'large';
export type DongengImageMode = 'dengan' | 'tanpa';
export type AudioState = 'mati' | 'otomatis' | string; // string is soundId

interface ReaderState {
  theme: ReaderTheme;
  fontSize: FontSize;
  backgroundAudio: AudioState;
  dongengImageMode: DongengImageMode;
  dongengShowText: boolean;
  dongengSpeed: number;
  
  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: FontSize) => void;
  setBackgroundAudio: (audio: AudioState) => void;
  setDongengImageMode: (mode: DongengImageMode) => void;
  setDongengShowText: (show: boolean) => void;
  setDongengSpeed: (speed: number) => void;
  
  syncPreferences: (prefs: Partial<ReaderState>) => void;
}

const syncToDB = async (state: any) => {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return;
  
  const prefs = {
    theme: state.theme,
    fontSize: state.fontSize,
    backgroundAudio: state.backgroundAudio,
    dongengImageMode: state.dongengImageMode,
    dongengShowText: state.dongengShowText,
    dongengSpeed: state.dongengSpeed
  };
  
  await supabase.from('profiles').update({ reading_preferences: prefs }).eq('id', user.id);
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      theme: 'terang',
      fontSize: 'normal',
      backgroundAudio: 'mati',
      dongengImageMode: 'dengan',
      dongengShowText: true,
      dongengSpeed: 1,
      
      setTheme: (theme) => { set({ theme }); syncToDB(get()); },
      setFontSize: (fontSize) => { set({ fontSize }); syncToDB(get()); },
      setBackgroundAudio: (backgroundAudio) => { set({ backgroundAudio }); syncToDB(get()); },
      setDongengImageMode: (dongengImageMode) => { set({ dongengImageMode }); syncToDB(get()); },
      setDongengShowText: (dongengShowText) => { set({ dongengShowText }); syncToDB(get()); },
      setDongengSpeed: (dongengSpeed) => { set({ dongengSpeed }); syncToDB(get()); },
      
      syncPreferences: (prefs) => set((state) => ({ ...state, ...prefs })),
    }),
    {
      name: 'reader-preferences',
    }
  )
);

export const getThemeClasses = (theme: ReaderTheme) => {
  switch (theme) {
    case 'gelap':
      return {
        bg: 'bg-[#2C2318]',
        surface: 'bg-[#3A2E22]',
        textMain: 'text-[#F0E6D0]',
        textMuted: 'text-[#A08C72]',
        border: 'border-[#4A3C2E]',
        navBg: 'bg-[#241C14]',
        imageFilter: 'brightness-[0.75] saturate-[0.85]'
      };
    case 'hangat':
      return {
        bg: 'bg-[#F5EDDA]',
        surface: 'bg-[#F9F0DE]',
        textMain: 'text-[#3B2D1F]',
        textMuted: 'text-[#8A6E54]',
        border: 'border-[#D4C4A8]',
        navBg: 'bg-[#EDE0C8]',
        imageFilter: 'brightness-[0.95] saturate-[0.9]'
      };
    case 'terang':
    default:
      return {
        bg: 'bg-[#FDF9F1]',
        surface: 'bg-[#FFFFFF]',
        textMain: 'text-[#2E2A26]',
        textMuted: 'text-[#7D7268]',
        border: 'border-[#E8E0D0]',
        navBg: 'bg-[#F3EDE0]',
        imageFilter: ''
      };
  }
};
