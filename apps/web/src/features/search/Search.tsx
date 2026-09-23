import { useState, useMemo } from 'react';
import MiniSearch from 'minisearch';
import { DUMMY_STORIES, type StoryPin } from '../map/dummy-stories';
import { Input } from '../../ui/basic/Input';
import { Search as SearchIcon, MapPin } from 'lucide-react';

interface SearchProps {
  onSelectStory: (story: StoryPin) => void;
  onSelectLocation?: (loc: [number, number]) => void;
}

export function Search({ onSelectStory, onSelectLocation }: SearchProps) {
  const [query, setQuery] = useState('');
  
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'region', 'type'],
      storeFields: ['id', 'title', 'region', 'type', 'lat', 'lng'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2
      }
    });
    ms.addAll(DUMMY_STORIES);
    return ms;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return miniSearch.search(query);
  }, [query, miniSearch]);

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-w-full flex flex-col gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </div>
        <Input 
          type="text" 
          placeholder="Cari cerita atau daerah..." 
          className="pl-10 w-full bg-white/90 backdrop-blur shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      {query.trim().length > 0 && (
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto flex flex-col gap-1">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 p-2 text-center">Tidak ada hasil ditemukan.</p>
          ) : (
            results.map((res: any) => (
              <button 
                key={res.id}
                className="text-left px-3 py-2 rounded-lg hover:bg-teal/10 transition-colors flex items-center gap-3"
                onClick={() => {
                  const story = DUMMY_STORIES.find(s => s.id === res.id);
                  if (story) {
                    onSelectStory(story);
                    if (onSelectLocation) onSelectLocation([story.lng, story.lat]);
                  }
                  setQuery('');
                }}
              >
                <div className="bg-teal/20 p-2 rounded-full text-teal">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{res.title}</div>
                  <div className="text-xs text-gray-500">{res.region} &bull; {res.type}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
