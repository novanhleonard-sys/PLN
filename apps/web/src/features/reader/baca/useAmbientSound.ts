import { useEffect, useRef } from 'react';
import { useComputedPrefs } from '../store/useReaderStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

// Helper hook to manage ambient sound playing
export const useAmbientSound = (mode: 'Baca' | 'Dongeng', storyType?: string, currentTags?: string[]) => {
  const prefs = useComputedPrefs();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch ambient sounds and rules
  const { data: sounds } = useQuery({
    queryKey: ['ambient_sounds'],
    queryFn: async () => {
      const { data } = await supabase.from('ambient_sounds').select('*').eq('is_active', true);
      return data || [];
    }
  });

  const { data: rules } = useQuery({
    queryKey: ['ambient_sound_rules'],
    queryFn: async () => {
      const { data } = await supabase.from('ambient_sound_rules').select('*').order('priority', { ascending: false });
      return data || [];
    }
  });

  useEffect(() => {
    if (mode === 'Dongeng' || !prefs.bgAudioOn || !sounds || !rules) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    let targetSoundUrl: string | null = null;
    let targetVolume = 1.0;
    let targetLoop = true;

    if (!prefs.bgAudioSoundId) {
      // Find matching rule
      const matchingRule = rules.find((r: any) => {
        if (r.story_type && r.story_type === storyType) return true;
        if (r.scene_tags && r.scene_tags.length > 0 && currentTags) {
           return r.scene_tags.some((tag: string) => currentTags.includes(tag));
        }
        return false;
      });
      
      if (matchingRule) {
        const sound = sounds.find((s: any) => s.id === matchingRule.sound_id);
        if (sound) {
          targetSoundUrl = sound.audio_url;
          targetVolume = sound.volume;
          targetLoop = sound.is_looping;
        }
      } else if (sounds.length > 0) {
        // Fallback to first available if otomatis but no rule matches
        targetSoundUrl = sounds[0].audio_url;
        targetVolume = sounds[0].volume;
        targetLoop = sounds[0].is_looping;
      }
    } else if (true) {
      // It's a specific sound ID
      const sound = sounds.find((s: any) => s.id === prefs.bgAudioSoundId);
      if (sound) {
        targetSoundUrl = sound.audio_url;
        targetVolume = sound.volume;
        targetLoop = sound.is_looping;
      }
    }

    if (targetSoundUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(targetSoundUrl);
      } else if (audioRef.current.src !== targetSoundUrl) {
        audioRef.current.pause();
        audioRef.current = new Audio(targetSoundUrl);
      }
      
      audioRef.current.volume = targetVolume;
      audioRef.current.loop = targetLoop;
      audioRef.current.play().catch(() => {
        // Autoplay policy might block it until user interacts
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      // cleanup on unmount
    };
  }, [mode, prefs.bgAudioOn, prefs.bgAudioSoundId, sounds, rules, storyType, currentTags]);
  
  // Cleanup on global unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
};
