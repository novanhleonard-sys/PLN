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
  
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'region', 'type'],
      storeFields: ['id', 'title', 'region', 'type', 'lat', 'lng'],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2
      }
    });
    ms.addAll(stories);
    return ms;
  }, [stories]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return miniSearch.search(query);
  }, [query, miniSearch]);

  return (
    <div className="absolute top-4 left-4 z-20 w-80 max-w-full flex flex-col gap-2">
      <Input type="text" placeholder="Cari cerita atau daerah..." leftIcon="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
      
      {query.trim().length > 0 && (
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto flex flex-col gap-1">
          {results.length === 0 ? (
            <p className="text-sm text-gray-500 p-2 text-center">Tidak ada hasil ditemukan.</p>
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
                }}
              >
                <div className="bg-teal/20 p-2 rounded-full text-teal">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{res.title}</div>
                  <div className="text-xs text-gray-500">{res.region} &bull; {res.type}</div>
                </div>
              </Button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

