import { useState, useEffect } from 'react';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { SidePanel } from '../../ui/layers/SidePanel';
import { Sheet } from '../../ui/layers/Sheet';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { type StoryPin } from '../map/dummy-stories';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { GateModal } from '../auth/GateModal';
import { supabase } from '../../lib/supabase';

interface StoryCardProps {
  story: StoryPin | null;
  onClose: () => void;
}

export function StoryCard({ story, onClose }: StoryCardProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readHistory, setReadHistory] = useState<any>(null);
  
  // Real version id for testing (Kancil)
  const testVersionId = '798ad75a-62eb-4153-abf6-5312b4c2147c';

  useEffect(() => {
    if (!user || !story) return;
    
    // Check saved status (using a fixed story id for demo)
    const testStoryId = '697008eb-d2b7-4157-ad8f-1ebdfe91bc35';
    
    supabase.from('saved_stories').select('*').eq('user_id', user.id).eq('story_id', testStoryId).single()
      .then(({ data }) => setIsSaved(!!data));
      
    supabase.from('read_history').select('*').eq('user_id', user.id).eq('version_id', testVersionId).single()
      .then(({ data }) => setReadHistory(data));
      
  }, [user, story]);

  const handleRead = () => {
    if (story) {
      navigate(`/baca/` + testVersionId);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setIsGateOpen(true);
      return;
    }
    
    const testStoryId = '697008eb-d2b7-4157-ad8f-1ebdfe91bc35';
    
    if (isSaved) {
      await supabase.from('saved_stories').delete().eq('user_id', user.id).eq('story_id', testStoryId);
      setIsSaved(false);
    } else {
      await supabase.from('saved_stories').insert({ user_id: user.id, story_id: testStoryId });
      setIsSaved(true);
    }
  };

  const content = story ? (
    <div className="flex flex-col h-full gap-4">
      <div className="w-full aspect-video bg-cream rounded-xl flex items-center justify-center overflow-hidden relative">
        <Icon name="BookOpen" size={48} className="text-border-light absolute opacity-20" />
        <div className="z-10 font-fredoka font-bold text-teal text-xl opacity-50">
          Cover Image
        </div>
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-coral bg-coral/10 px-2 py-1 rounded-full uppercase tracking-wider">
            {story.type}
          </span>
          <span className="text-xs text-text-muted">{story.region}</span>
        </div>
        <h2 className="text-2xl font-fredoka text-text-main mb-2">{story.title}</h2>
        <p className="text-sm text-text-light leading-relaxed">
          Ini adalah ringkasan singkat tentang kisah {story.title} dari {story.region}. 
          Masyarakat lokal mempercayai kisah ini secara turun temurun.
        </p>
      </div>

      <div className="mt-auto pt-4 flex gap-3">
        <Button onClick={handleRead} variant="primary" className="flex-1">
          {readHistory ? `Lanjutkan halaman ${readHistory.last_page_idx}` : 'Lanjut baca'}
        </Button>
        <Button onClick={handleSave} variant="secondary" className={`px-3 ${isSaved ? 'text-coral' : ''}`} aria-label="Simpan cerita">
          <Icon name="Bookmark" size={20} className={isSaved ? 'fill-current' : ''} />
        </Button>
      </div>
      
      <GateModal 
        isOpen={isGateOpen} 
        onClose={() => setIsGateOpen(false)} 
        message="Masuk untuk menyimpan cerita ke koleksi Anda." 
      />
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <SidePanel isOpen={!!story} className="absolute top-4 bottom-4 left-4 rounded-2xl shadow-warm-lg z-20 !h-auto">
        <div className="p-6 h-full flex flex-col relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-cream text-text-muted hover:text-text-main rounded-full z-10">
            <Icon name="X" size={16} />
          </button>
          {content}
        </div>
      </SidePanel>
    );
  }

  return (
    <Sheet isOpen={!!story} onClose={onClose}>
      {content}
    </Sheet>
  );
}
