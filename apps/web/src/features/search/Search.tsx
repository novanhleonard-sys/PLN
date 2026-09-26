import { useState, useMemo } from 'react';
import MiniSearch from 'minisearch';
import type { StoryPin } from '../map/useStories';
import { Input } from '../../ui/basic/Input';
import { Button } from '../../ui/basic/Button';

import { MapPin } from 'lucide-react';

interface SearchProps {
  stories: StoryPin[];
  onSelectStory: (story: StoryPin) => void;
  onSelectLocation?: (loc: [number, number]) => void;
}

export function Search({ stories, onSelectStory, onSelectLocation }: SearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filterType, setFilterType] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterAudio, setFilterAudio] = useState<boolean>(false);
  
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'region', 'type'],
      storeFields: ['id', 'title', 'region', 'type', 'lat', 'lng', 'dongengReady'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2
      }
    });
    ms.addAll(stories);
    return ms;
  }, [stories]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    stories.forEach(s => { if (s.region) regions.add(s.region); });
    return Array.from(regions).sort();
  }, [stories]);

  const results = useMemo(() => {
    let baseResults: any[] = [];
    
    if (query.trim()) {
      baseResults = miniSearch.search(query);
    } else if (filterType || filterRegion || filterAudio) {
      baseResults = stories.map(s => ({
        id: s.id, title: s.title, region: s.region, type: s.type, dongengReady: s.dongengReady
      }));
    } else {
      return [];
    }
    
    if (filterType) {
      baseResults = baseResults.filter(r => r.type?.toLowerCase() === filterType.toLowerCase());
    }
    if (filterRegion) {
      baseResults = baseResults.filter(r => r.region === filterRegion);
    }
    if (filterAudio) {
      baseResults = baseResults.filter(r => r.dongengReady === true);
    }
    
    return baseResults;
  }, [query, miniSearch, filterType, filterRegion, filterAudio, stories]);

  const isFilterActive = !!filterType || !!filterRegion || filterAudio;
  const showResults = query.trim().length > 0 || isFilterActive;

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-w-full flex flex-col gap-2 font-nunito">
      <Input 
        type="text" 
        placeholder="Cari cerita atau daerah..." 
        leftIcon="Search" 
        rightIcon="SlidersHorizontal"
        rightIconDivider={true}
        onRightIconClick={() => setShowFilters(!showFilters)}
        value={query} 
        onChange={(e) => { setQuery(e.target.value); setShowFilters(false); }} 
      />
      
      {showFilters && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-500 uppercase">Jenis Cerita</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal"
            >
              <option value="">Semua Jenis</option>
              <option value="legenda">Legenda</option>
              <option value="mite">Mite</option>
              <option value="fabel">Fabel</option>
              <option value="dongeng">Dongeng</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-500 uppercase">Daerah</label>
            <select 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal"
            >
              <option value="">Semua Daerah</option>
              {uniqueRegions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              id="filter-audio"
              checked={filterAudio}
              onChange={(e) => setFilterAudio(e.target.checked)}
              className="w-4 h-4 text-teal rounded focus:ring-teal cursor-pointer"
            />
            <label htmlFor="filter-audio" className="text-sm text-stone-700 cursor-pointer select-none">
              Hanya yang memiliki Audio
            </label>
          </div>
        </div>
      )}

      {showResults && !showFilters && (
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-2 max-h-60 overflow-y-auto flex flex-col gap-1">
          {results.length === 0 ? (
            <p className="text-sm text-stone-500 p-2 text-center">Tidak ada hasil ditemukan.</p>
          ) : (
            results.map((res: any) => (
              <Button variant="ghost" 
                key={res.id}
                className="w-full justify-start px-3 py-2 !h-auto"
                onClick={() => {
                  const story = stories.find(s => s.id === res.id);
                  if (story) {
                    onSelectStory(story);
                    if (onSelectLocation) onSelectLocation([story.lng, story.lat]);
                  }
                  setQuery('');
                  setFilterType('');
                  setFilterRegion('');
                  setFilterAudio(false);
                }}
              >
                <div className="bg-teal/20 p-2 rounded-full text-teal shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-stone-900">{res.title}</div>
                  <div className="text-xs text-stone-500">{res.region} &bull; {res.type} {res.dongengReady ? ' • ??' : ''}</div>
                </div>
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
