import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export const useStoryVersions = (versionId: string) => {
  return useQuery({
    queryKey: ['story-versions', versionId],
    queryFn: async () => {
      // get current version first
      const { data: currentVersion, error: vErr } = await supabase
        .from('story_versions')
        .select('*, story:stories(*)')
        .eq('id', versionId)
        .single();
        
      if (vErr) throw vErr;
      
      // get adaptations for this version
      const { data: adaptations, error: aErr } = await supabase
        .from('adaptations')
        .select('*')
        .eq('version_id', versionId);
        
      if (aErr) throw aErr;
      
      return { version: currentVersion, adaptations };
    },
    enabled: !!versionId
  });
};

export const usePages = (adaptationId: string) => {
  return useQuery({
    queryKey: ['pages', adaptationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*, scene:scenes(*)')
        .eq('adaptation_id', adaptationId)
        .order('idx', { ascending: true });
        
      if (error) throw error;
      return data;
    },
    enabled: !!adaptationId
  });
};

export const usePageAudio = (pageId: string) => {
  return useQuery({
    queryKey: ['page-audio', pageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_audio')
        .select('*')
        .eq('page_id', pageId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!pageId
  });
};

export const useReadHistory = (versionId: string) => {
  return useQuery({
    queryKey: ['read-history', versionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('read_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('version_id', versionId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!versionId
  });
};

export const useSaved = (storyId: string) => {
  return useQuery({
    queryKey: ['saved-stories', storyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('saved_stories')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!storyId
  });
};
