import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface RegionGroup {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export function useRegionGroups() {
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      const { data } = await supabase.from('region_groups').select('*').order('name');
      if (data) setRegionGroups(data as any);
      setLoading(false);
    }
    fetchGroups();
  }, []);

  return { regionGroups, loading };
}
