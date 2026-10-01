import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export type StoryType = 'fabel' | 'legenda' | 'mite' | 'dongeng';

export interface StoryPin {
  pinImage?: string;
  sources?: any[];
  synopsis?: string;
  id: string;
  slug: string;
  title: string;
  type: StoryType;
  lat: number;
  lng: number;
  tier: number;
  score: number;
  cover?: string;
  region?: string;
  versionId?: string;
  versionCount: number;
  dongengReady: boolean;
  duration: number;
}

export function useStories() {
  return useQuery({
    queryKey: ['public-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id, slug, title, type, lat, lng, synopsis, hero_image_path, pin_image_path,
          tier, status, regions(name, region_group_id, region_groups(name, slug)), story_versions(id, status, asset_status, body, sources, adaptations(status, audio_status))
        `);
      if (error) throw error;
      
      const pins: StoryPin[] = [];
      for (const story of data) {
        // Find published version
        if (story.status !== 'published') continue;
        const publishedVersion = story.story_versions?.find((v: any) => v.status === 'published');
        if (!publishedVersion) continue;
        
        // Asumsi kecepatan baca rata-rata 200 kata per menit
        const wordCount = publishedVersion.body?.split(/\s+/).length || 0;
        const duration = Math.max(1, Math.ceil(wordCount / 200));

        pins.push({
          id: story.id,
          slug: story.slug || story.id,
          title: story.title,
          type: story.type as StoryType,
          lat: story.lat,
          lng: story.lng,
          tier: story.tier || 1,
          score: 100, // Dummy score or derived from story_stats later
          cover: story.hero_image_path ? supabase.storage.from('story-media').getPublicUrl(story.hero_image_path).data.publicUrl : undefined,
          synopsis: story.synopsis || '',
          pinImage: story.pin_image_path ? supabase.storage.from('story-media').getPublicUrl(story.pin_image_path).data.publicUrl : undefined,
          sources: publishedVersion.sources || [],
          region: Array.isArray(story.regions) ? ((story.regions[0]?.region_groups as any)?.name || story.regions[0]?.name) : ((story.regions as any)?.region_groups?.name || (story.regions as any)?.name),
          versionId: publishedVersion.id,
          versionCount: story.story_versions?.filter((v: any) => v.status === 'published').length || 1,
          dongengReady: publishedVersion.adaptations?.some((a: any) => a.audio_status === 'ready') || false,
          duration: duration
        });
      }
      return pins;
    }
  });
}
