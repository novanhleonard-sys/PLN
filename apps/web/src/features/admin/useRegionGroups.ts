import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface RegionGroup {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export function useRegionGroups() {
  const [regionGroups, setRegionGroups] = useState<RegionGroup[]>([]);
  const [parentGroups, setParentGroups] = useState<RegionGroup[]>([]);
  const [subGroups, setSubGroups] = useState<RegionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      const { data } = await supabase.from('region_groups').select('*').order('name');
      if (data) {
        const typedData = data as RegionGroup[];
        setRegionGroups(typedData);
        setParentGroups(typedData.filter(g => !g.parent_id));
        setSubGroups(typedData.filter(g => g.parent_id));
      }
      setLoading(false);
    }
    fetchGroups();
  }, []);

  return { regionGroups, parentGroups, subGroups, loading };
}
