import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export type StoryType = 'fabel' | 'legenda' | 'mite' | 'dongeng';

export interface StoryPin {
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
}

export function useStories() {
  return useQuery({
    queryKey: ['public-stories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id, title, type, lat, lng,
          story_versions ( id, status, tier, cover_path, region )
        `);
      if (error) throw error;
      
      const pins: StoryPin[] = [];
      for (const story of data) {
        // Find published version
        const publishedVersion = story.story_versions?.find((v: any) => v.status === 'published');
        if (!publishedVersion) continue;
        
        pins.push({
          id: story.id,
          slug: story.id, // using id as slug for now, or we can use title
          title: story.title,
          type: story.type as StoryType,
          lat: story.lat,
          lng: story.lng,
          tier: publishedVersion.tier || 1,
          score: 100, // Dummy score or derived from story_stats later
          cover: publishedVersion.cover_path,
          region: publishedVersion.region,
          versionId: publishedVersion.id
        });
      }
      return pins;
    }
  });
}

