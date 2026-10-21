import { useEffect, useRef } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface AmbientSound {
  id: string;
  name: string;
  audio_url: string;
  volume: number;
  is_looping: boolean;
  is_active: boolean;
  story_type?: string | null;
  region_group_ids?: string[] | null;
}

export function getMatchingAmbientSound(sounds?: AmbientSound[] | null, story?: any): AmbientSound | null {
  if (!sounds || sounds.length === 0 || !story) return null;

  const storyType = story.type;
  const regionGroupId = story.region?.region_group_id || story.region?.region_group?.id;
  const parentRegionGroupId = story.region?.region_group?.parent_id;

  const activeSounds = sounds.filter(s => s.is_active);

  let bestSound: AmbientSound | null = null;
  let highestScore = 0;

  for (const s of activeSounds) {
    const soundRegionIds = s.region_group_ids || [];
    const hasRegionFilter = soundRegionIds.length > 0;
    if (!hasRegionFilter) continue; // Wajib memiliki pengaturan rumpun wilayah

    const matchesDirectRegion = regionGroupId ? soundRegionIds.includes(regionGroupId) : false;
    const matchesParentRegion = parentRegionGroupId ? soundRegionIds.includes(parentRegionGroupId) : false;
    if (!matchesDirectRegion && !matchesParentRegion) continue; // Wilayah tidak cocok

    const hasTypeFilter = !!s.story_type;
    if (!hasTypeFilter) continue; // Wajib memiliki pengaturan jenis cerita spesifik (tidak null)
    if (s.story_type !== storyType) continue; // Jenis cerita berbeda (misal: dongeng vs legenda)

    // Kedua syarat (jenis cerita & lokasi) cocok secara spesifik
    const score = matchesDirectRegion ? 2 : 1;
    if (score > highestScore) {
      highestScore = score;
      bestSound = s;
    }
  }

  return bestSound;
}

export function getSoundSimilarityScore(sound: AmbientSound, story?: any): number {
  if (!story) return 0;
  const storyType = story.type;
  const regionGroupId = story.region?.region_group_id || story.region?.region_group?.id;
  const parentRegionGroupId = story.region?.region_group?.parent_id;
  const soundRegionIds = sound.region_group_ids || [];

  const matchesDirectRegion = regionGroupId ? soundRegionIds.includes(regionGroupId) : false;
  const matchesParentRegion = parentRegionGroupId ? soundRegionIds.includes(parentRegionGroupId) : false;
  const matchesType = !!sound.story_type && sound.story_type === storyType;

  if (matchesDirectRegion && matchesType) return 10; // Sama daerah dan sama jenis cerita
  if (matchesDirectRegion) return 7;                 // Sama daerah tapi beda jenis cerita
  if (matchesParentRegion && matchesType) return 5;  // Sama jenis cerita dan daerah berdekatan (serumpun)
  if (matchesParentRegion) return 4;                 // Daerah berdekatan (serumpun)
  if (matchesType) return 3;                         // Sama jenis cerita tapi daerah lain
  return 1;                                          // Lainnya
}

export function sortSoundsBySimilarity(sounds: AmbientSound[], story?: any): AmbientSound[] {
  return [...sounds].sort((a, b) => {
    const scoreA = getSoundSimilarityScore(a, story);
    const scoreB = getSoundSimilarityScore(b, story);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });
}

export const useAmbientSound = (mode: 'Baca' | 'Dongeng', story?: any) => {
  const { storyOverrides, activeStoryId, globalPrefs } = useReaderStore();
  const storyId = story?.id || activeStoryId;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch active ambient sounds
  const { data: sounds } = useQuery({
    queryKey: ['ambient_sounds'],
    queryFn: async () => {
      const { data } = await supabase.from('ambient_sounds').select('*').eq('is_active', true);
      return (data || []) as AmbientSound[];
    }
  });

  const matchingSound = getMatchingAmbientSound(sounds, story);

  // Determine user override
  const userOverride = storyId ? storyOverrides[storyId] : undefined;
  const effectiveBgAudioOn = userOverride?.bgAudioOn !== undefined
    ? userOverride.bgAudioOn
    : (matchingSound !== null); // Default: ON if configured, OFF if not configured

  const selectedSoundId = userOverride?.bgAudioSoundId ?? globalPrefs.bgAudioSoundId;
  const effectiveSound = selectedSoundId
    ? sounds?.find(s => s.id === selectedSoundId) || null
    : matchingSound;

  useEffect(() => {
    if (mode === 'Dongeng' || !effectiveBgAudioOn || !effectiveSound) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const targetUrl = effectiveSound.audio_url;
    const targetVolume = effectiveSound.volume ?? 1.0;
    const targetLoop = effectiveSound.is_looping ?? true;

    if (!audioRef.current) {
      audioRef.current = new Audio(targetUrl);
    } else if (audioRef.current.src !== targetUrl) {
      audioRef.current.pause();
      audioRef.current = new Audio(targetUrl);
    }

    audioRef.current.volume = targetVolume;
    audioRef.current.loop = targetLoop;
    audioRef.current.play().catch(() => {
      // Autoplay policy might block it until user interacts with the page
    });

    return () => {
      // pause on cleanup
    };
  }, [mode, effectiveBgAudioOn, effectiveSound]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
};
