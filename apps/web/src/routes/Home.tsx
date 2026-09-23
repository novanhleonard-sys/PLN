import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Splash } from '../features/splash/Splash';
import { MainMap } from '../features/map/MainMap';
import { Search } from '../features/search/Search';
import { StoryCard } from '../features/story-card/StoryCard';
import { DUMMY_STORIES, type StoryPin } from '../features/map/dummy-stories';
import { Button } from '../ui/basic/Button';

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryPin | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const story = DUMMY_STORIES.find(s => s.slug === slug);
      if (story) {
        setSelectedStory(story);
        setSearchedLocation([story.lng, story.lat]);
      }
    }
  }, [slug]);
  const [styleType, setStyleType] = useState<'A' | 'B'>('A');

  return (
    <div className="w-full h-screen flex flex-col font-nunito relative overflow-hidden bg-[#d1f4f9]">
      <Splash onComplete={() => setSplashDone(true)} />
      
      {/* Peta ada di belakang, load lebih awal */}
      <MainMap 
        styleType={styleType} 
        onPinClick={setSelectedStory} 
        searchedLocation={searchedLocation}
      />
      
      {splashDone && (
        <>
          <Search 
            onSelectStory={setSelectedStory} 
            onSelectLocation={setSearchedLocation} 
          />
          
          <StoryCard 
            story={selectedStory} 
            onClose={() => { setSelectedStory(null); navigate('/'); }} 
          />
          
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-warm flex gap-2 items-center">
            <Button 
              variant={styleType === 'A' ? 'primary' : 'secondary'} 
              onClick={() => setStyleType('A')}
            >
              Gaya A
            </Button>
            <Button 
              variant={styleType === 'B' ? 'primary' : 'secondary'} 
              onClick={() => setStyleType('B')}
            >
              Gaya B
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
