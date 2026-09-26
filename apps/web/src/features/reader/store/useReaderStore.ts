import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../../../lib/supabase';

export type ReaderTheme = 'terang' | 'hangat' | 'gelap';
export type FontSize = 'kecil' | 'sedang' | 'besar';
export type DongengImageMode = 'dengan' | 'tanpa';

export interface ReaderPrefs {
  theme: ReaderTheme;
  fontSizeBaca: FontSize;
  fontSizeDongeng: FontSize;
  bgAudioOn: boolean;
  bgAudioSoundId: string | null;
  dongengImageMode: DongengImageMode;
  dongengShowText: boolean;
  dongengSpeed: number;
}

interface ReaderState {
  globalPrefs: ReaderPrefs;
  storyOverrides: Record<string, Partial<ReaderPrefs>>;
  activeStoryId: string | null;
  
  setActiveStoryId: (id: string | null) => void;
  updateGlobal: (prefs: Partial<ReaderPrefs>) => void;
  updateOverride: (storyId: string, prefs: Partial<ReaderPrefs>) => void;
  resetOverride: (storyId: string) => void;
  syncPreferences: (prefs: Partial<ReaderPrefs>) => void;
}

const syncToDB = async (prefs: ReaderPrefs) => {
  const { data } = await supabase.auth.getSession();
  const user = data?.session?.user;
  if (!user) return;
  
  await supabase.from('profiles').update({ reading_preferences: prefs }).eq('id', user.id);
};

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      globalPrefs: {
        theme: 'terang',
        fontSizeBaca: 'sedang',
        fontSizeDongeng: 'sedang',
        bgAudioOn: false,
        bgAudioSoundId: null,
        dongengImageMode: 'dengan',
        dongengShowText: true,
        dongengSpeed: 1,
      },
      storyOverrides: {},
      activeStoryId: null,
      
      setActiveStoryId: (id) => set({ activeStoryId: id }),
      
      updateGlobal: (prefs) => {
        set((state) => {
          const newGlobal = { ...state.globalPrefs, ...prefs };
          syncToDB(newGlobal);
          return { globalPrefs: newGlobal };
        });
      },
      
      updateOverride: (storyId, prefs) => {
        set((state) => {
          const existing = state.storyOverrides[storyId] || {};
          return {
            storyOverrides: {
              ...state.storyOverrides,
              [storyId]: { ...existing, ...prefs }
            }
          };
        });
      },
      
      resetOverride: (storyId) => {
        set((state) => {
          const { [storyId]: removed, ...rest } = state.storyOverrides;
          return { storyOverrides: rest };
        });
      },
      
      syncPreferences: (prefs) => set((state) => ({ 
        globalPrefs: { ...state.globalPrefs, ...prefs } 
      })),
    }),
    {
      name: 'reader-preferences-v2',
    }
  )
);

export const useComputedPrefs = () => {
   const state = useReaderStore();
   if (!state.activeStoryId) return state.globalPrefs;
   return { ...state.globalPrefs, ...(state.storyOverrides[state.activeStoryId] || {}) };
};

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
        bg: 'bg-[#9C8A79]',
        surface: 'bg-[#A89684]',
        textMain: 'text-[#2E241B]',
        textMuted: 'text-[#524436]',
        border: 'border-[#8A7866]',
        navBg: 'bg-[#948170]',
        imageFilter: 'brightness-[0.85] saturate-[0.9]'
      };
    case 'terang':
    default:
      return {
        bg: 'bg-[#F5EDDA]',
        surface: 'bg-[#F9F0DE]',
        textMain: 'text-[#3B2D1F]',
        textMuted: 'text-[#8A6E54]',
        border: 'border-[#D4C4A8]',
        navBg: 'bg-[#EDE0C8]',
        imageFilter: 'brightness-[0.95] saturate-[0.95]'
      };
  }
};

export const getFontSizeClass = (size: FontSize) => {
  switch (size) {
    case 'kecil': return 'text-base md:text-lg leading-relaxed';
    case 'besar': return 'text-xl md:text-3xl leading-loose';
    case 'sedang':
    default: return 'text-lg md:text-2xl leading-relaxed';
  }
};
