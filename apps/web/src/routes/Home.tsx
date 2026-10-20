import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainMap } from '../features/map/MainMap';
import { Search } from '../features/search/Search';
import { StoryCard } from '../features/story-card/StoryCard';
import { useStories, type StoryPin } from '../features/map/useStories';
import { MapStyleToggle } from '../ui/basic/Misc';
import { UserMenu } from '../features/auth/UserMenu';
import { useAuth } from '../features/auth/AuthStore';
import { supabase } from '../lib/supabase';

const parseMapStyle = (val: string | null): 'A' | 'B' => {
  if (val === 'B' || val === 'lukisan') return 'B';
  return 'A';
};

export default function Home() {
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<StoryPin | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [filteredStories, setFilteredStories] = useState<StoryPin[] | null>(null);
  const { slug } = useParams();
  const { data: stories = [] } = useStories();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug && stories.length > 0) {
      const story = stories.find(s => s.slug === slug || s.id === slug);
      if (story) {
        setSelectedStory(story);
        setSearchedLocation([story.lng, story.lat]);
      }
    }
  }, [slug, stories]);

  const [styleType, setStyleType] = useState<'A' | 'B'>(() => {
    const saved = localStorage.getItem('pln_map_style');
    return parseMapStyle(saved);
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('pln_map_style');
      setStyleType(parseMapStyle(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleStyleChange = (style: 'A' | 'B') => {
    setStyleType(style);
    const prefName = style === 'B' ? 'lukisan' : 'kartun';
    localStorage.setItem('pln_map_style', prefName);
    if (user) {
      supabase.from('profiles').update({ preferred_map_style: prefName }).eq('id', user.id).then();
    }
  };

  const isFilterActive = (filteredStories !== null && filteredStories.length !== stories.length) || searchedLocation !== null;

  return (
    <div className="w-full h-screen flex flex-col font-nunito relative overflow-hidden bg-[#d1f4f9]">
      {/* Peta ada di belakang, load lebih awal */}
      <MainMap 
        styleType={styleType} 
        onPinClick={setSelectedStory} 
        searchedLocation={searchedLocation}
        stories={filteredStories || stories}
        isFilterActive={isFilterActive}
      />
      
      <>
          <Search stories={stories} onSelectStory={setSelectedStory} onSelectLocation={setSearchedLocation} onFilterChange={setFilteredStories} />
          
          <StoryCard 
            story={selectedStory} 
            onClose={() => { setSelectedStory(null); navigate('/'); }} 
          />
          
          {/* Bottom-left: map style toggle — z-30 so it stays above the sheet backdrop (z-40) but behind sheet panel (z-50) */}
          <div className="absolute bottom-6 left-4 z-30">
            <MapStyleToggle isPainting={styleType === 'A'} onChange={(isA) => handleStyleChange(isA ? 'A' : 'B')} />
          </div>

          {/* Top-right: user menu */}
          <div className="absolute top-4 right-4 z-[60]">
            <UserMenu />
          </div>
        </>
      </div>
  );
}

