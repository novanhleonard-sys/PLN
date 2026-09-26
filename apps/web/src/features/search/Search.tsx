import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MiniSearch from 'minisearch';
import type { StoryPin } from '../map/useStories';
import { Icon } from '../../ui/basic/Icon';
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filterType, setFilterType] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');
  const [filterAudio, setFilterAudio] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setShowFilters(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const expand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const miniSearch = useMemo(() => {
    const ms = new MiniSearch({
      fields: ['title', 'region', 'type'],
      storeFields: ['id', 'title', 'region', 'type', 'lat', 'lng', 'dongengReady'],
      searchOptions: { prefix: true, fuzzy: 0.2 }
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
    let base: any[] = [];
    if (query.trim()) {
      base = miniSearch.search(query);
    } else if (filterType || filterRegion || filterAudio) {
      base = stories.map(s => ({ id: s.id, title: s.title, region: s.region, type: s.type, dongengReady: s.dongengReady }));
    } else {
      return [];
    }
    if (filterType) base = base.filter(r => r.type?.toLowerCase() === filterType.toLowerCase());
    if (filterRegion) base = base.filter(r => r.region === filterRegion);
    if (filterAudio) base = base.filter(r => r.dongengReady === true);
    return base;
  }, [query, miniSearch, filterType, filterRegion, filterAudio, stories]);

  const isFilterActive = !!filterType || !!filterRegion || filterAudio;
  const showResults = (query.trim().length > 0 || isFilterActive) && !showFilters;

  return (
    <div ref={wrapRef} className="absolute top-4 left-4 z-[60] flex flex-col gap-2 font-nunito">
      {/* Collapsed = pill with icons. Expanded = input bar */}
      <div className="flex items-center gap-2">
        <motion.div
          layout
          className="flex items-center bg-white rounded-full shadow-md overflow-hidden h-11"
          initial={false}
          animate={{ width: isExpanded ? 280 : 88 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200 }}
        >
          {/* Search icon — always visible */}
          <button
            onClick={expand}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-stone-500 hover:text-teal transition-colors"
            aria-label="Buka pencarian"
          >
            <Icon name="Search" size={20} />
          </button>

          {/* Input — visible when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                type="text"
                placeholder="Cari cerita atau daerah..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowFilters(false); }}
                className="flex-1 min-w-0 h-full text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none bg-transparent pr-2"
              />
            )}
          </AnimatePresence>

          {/* Filter icon — always visible */}
          <button
            onClick={() => { if (!isExpanded) expand(); setShowFilters(f => !f); }}
            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center transition-colors ${isFilterActive || showFilters ? 'text-teal' : 'text-stone-500 hover:text-teal'}`}
            aria-label="Filter"
          >
            <Icon name="SlidersHorizontal" size={20} />
            {isFilterActive && <span className="absolute top-1 right-1 w-2 h-2 bg-teal rounded-full" />}
          </button>
        </motion.div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-4 flex flex-col gap-3 w-72"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-500 uppercase">Jenis Cerita</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal">
                <option value="">Semua Jenis</option>
                <option value="legenda">Legenda</option>
                <option value="mite">Mite</option>
                <option value="fabel">Fabel</option>
                <option value="dongeng">Dongeng</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-stone-500 uppercase">Daerah</label>
              <select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal">
                <option value="">Semua Daerah</option>
                {uniqueRegions.map(r => (<option key={r} value={r}>{r}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="filter-audio" checked={filterAudio} onChange={(e) => setFilterAudio(e.target.checked)} className="w-4 h-4 text-teal rounded focus:ring-teal cursor-pointer" />
              <label htmlFor="filter-audio" className="text-sm text-stone-700 cursor-pointer select-none">Memiliki audio</label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-2 max-h-60 overflow-y-auto flex flex-col gap-1 w-72"
          >
            {results.length === 0 ? (
              <p className="text-sm text-stone-500 p-2 text-center">Tidak ada hasil ditemukan.</p>
            ) : (
              results.map((res: any) => (
                <Button variant="ghost" key={res.id} className="w-full justify-start px-3 py-2 !h-auto"
                  onClick={() => {
                    const story = stories.find(s => s.id === res.id);
                    if (story) { onSelectStory(story); if (onSelectLocation) onSelectLocation([story.lng, story.lat]); }
                    setQuery(''); setFilterType(''); setFilterRegion(''); setFilterAudio(false); setIsExpanded(false);
                  }}
                >
                  <div className="bg-teal/20 p-2 rounded-full text-teal shrink-0"><MapPin size={16} /></div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-stone-900">{res.title}</div>
                    <div className="text-xs text-stone-500">{res.region} &bull; {res.type}</div>
                  </div>
                </Button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
