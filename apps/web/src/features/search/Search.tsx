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
  onFilterChange?: (filtered: StoryPin[]) => void;
}

export function Search({ stories, onSelectStory, onSelectLocation, onFilterChange }: SearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filterType, setFilterType] = useState<string>('');
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterAudio, setFilterAudio] = useState<boolean>(false);

  const activeStories = useMemo(() => {
    let base = stories;
    if (filterType) base = base.filter(s => s.type?.toLowerCase() === filterType.toLowerCase());
    if (filterRegions.length > 0) base = base.filter(s => s.region && filterRegions.includes(s.region));
    if (filterAudio) base = base.filter(s => s.dongengReady === true);
    return base;
  }, [stories, filterType, filterRegions, filterAudio]);

  useEffect(() => {
    if (onFilterChange) onFilterChange(activeStories);
  }, [activeStories, onFilterChange]);

  
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

  const regionTree = useMemo(() => {
    const tree: Record<string, Set<string>> = {};
    stories.forEach(s => {
      if (s.region) {
        const besar = (s as any).region_besar || 'Lainnya';
        if (!tree[besar]) tree[besar] = new Set();
        tree[besar].add(s.region);
      }
    });
    return Object.entries(tree).map(([besar, subs]) => ({ besar, subs: Array.from(subs).sort() })).sort((a,b) => a.besar.localeCompare(b.besar));
  }, [stories]);

  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [hoveredBesar, setHoveredBesar] = useState<string | null>(null);

  const results = useMemo(() => {
    let base: any[] = [];
    if (query.trim()) {
      base = miniSearch.search(query);
    } else if (filterType || filterRegions.length > 0 || filterAudio) {
      base = stories.map(s => ({ id: s.id, title: s.title, region: s.region, type: s.type, dongengReady: s.dongengReady }));
    } else {
      return [];
    }
    if (filterType) base = base.filter(r => r.type?.toLowerCase() === filterType.toLowerCase());
    if (filterRegions.length > 0) base = base.filter(r => r.region && filterRegions.includes(r.region));
    if (filterAudio) base = base.filter(r => r.dongengReady === true);
    return base;
  }, [query, miniSearch, filterType, filterRegions, filterAudio, stories]);

  const isFilterActive = !!filterType || filterRegions.length > 0 || filterAudio;
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
              <div className="relative">
                <button 
                  onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                  className="w-full flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-teal"
                >
                  <span className="truncate">
                    {filterRegions.length === 0 ? 'Semua Daerah' : `${filterRegions.length} Daerah Terpilih`}
                  </span>
                  <Icon name="ChevronDown" size={16} />
                </button>

                {isRegionDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-stone-200 shadow-xl rounded-xl z-50 py-1">
                    <div 
                      className="px-3 py-2 text-sm hover:bg-teal-50 cursor-pointer flex items-center gap-2"
                      onClick={() => { setFilterRegions([]); setIsRegionDropdownOpen(false); }}
                    >
                      <div className={`w-4 h-4 rounded border flex justify-center items-center ${filterRegions.length === 0 ? 'bg-teal border-teal text-white' : 'border-stone-300'}`}>
                        {filterRegions.length === 0 && <Icon name="Check" size={12} />}
                      </div>
                      Semua Daerah
                    </div>
                    {regionTree.map(rt => (
                      <div 
                        key={rt.besar}
                        className="relative group"
                        onMouseEnter={() => setHoveredBesar(rt.besar)}
                        onMouseLeave={() => setHoveredBesar(null)}
                      >
                        <div className="px-3 py-2 text-sm hover:bg-stone-50 flex justify-between items-center cursor-default">
                          <span className="truncate pr-2">{rt.besar}</span>
                          <Icon name="ChevronRight" size={14} className="text-stone-400 shrink-0" />
                        </div>
                        {hoveredBesar === rt.besar && (
                          <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-stone-200 shadow-xl rounded-xl py-1 max-h-64 overflow-y-auto z-[60]">
                            {rt.subs.map(sub => {
                              const isChecked = filterRegions.includes(sub);
                              return (
                                <div 
                                  key={sub}
                                  className="px-3 py-2 text-sm hover:bg-teal-50 cursor-pointer flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isChecked) {
                                      setFilterRegions(filterRegions.filter(r => r !== sub));
                                    } else {
                                      setFilterRegions([...filterRegions, sub]);
                                    }
                                  }}
                                >
                                  <div className={`w-4 h-4 rounded border flex justify-center items-center ${isChecked ? 'bg-teal border-teal text-white' : 'border-stone-300'}`}>
                                    {isChecked && <Icon name="Check" size={12} />}
                                  </div>
                                  {sub}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                    setQuery(''); setFilterType(''); setFilterRegions([]); setFilterAudio(false); setIsExpanded(false);
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
