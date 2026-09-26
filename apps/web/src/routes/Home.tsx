import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Splash } from '../features/splash/Splash';
import { MainMap } from '../features/map/MainMap';
import { Search } from '../features/search/Search';
import { StoryCard } from '../features/story-card/StoryCard';
import { useStories, type StoryPin } from '../features/map/useStories';
import { MapStyleToggle } from '../ui/basic/Misc';
import { UserMenu } from '../features/auth/UserMenu';

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryPin | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const { slug } = useParams();
  const { data: stories = [] } = useStories();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const story = stories.find(s => s.slug === slug || s.id === slug);
      if (story) {
        setSelectedStory(story);
        setSearchedLocation([story.lng, story.lat]);
      }
    }
  }, [slug]);
  const [styleType, setStyleType] = useState<'A' | 'B'>(() => {
    const saved = localStorage.getItem('pln_map_style');
    return (saved === 'A' || saved === 'B') ? saved : 'A';
  });

  const handleStyleChange = (style: 'A' | 'B') => {
    setStyleType(style);
    localStorage.setItem('pln_map_style', style);
  };

  return (
    <div className="w-full h-screen flex flex-col font-nunito relative overflow-hidden bg-[#d1f4f9]">
      <Splash onComplete={() => setSplashDone(true)} />
      
      {/* Peta ada di belakang, load lebih awal */}
      <MainMap 
        styleType={styleType} 
        onPinClick={setSelectedStory} 
        searchedLocation={searchedLocation}
          stories={stories}
      />
      
      {splashDone && (
        <>
          <Search stories={stories} 
            onSelectStory={setSelectedStory} 
            onSelectLocation={setSearchedLocation} 
          />
          
          <StoryCard 
            story={selectedStory} 
            onClose={() => { setSelectedStory(null); navigate('/'); }} 
          />
          
          <MapStyleToggle isPainting={styleType === 'A'} onChange={(isA) => handleStyleChange(isA ? 'A' : 'B')} className="absolute bottom-6 left-6 z-20" />
          <div className="absolute top-6 right-6 z-40">
            <UserMenu />
          </div>
        </>
      )}
    </div>
  );
}

