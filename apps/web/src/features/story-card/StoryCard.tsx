import { useState, useEffect } from 'react';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { SidePanel } from '../../ui/layers/SidePanel';
import { Sheet } from '../../ui/layers/Sheet';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { Chip } from '../../ui/basic/Chip';
import { type StoryPin } from '../map/useStories';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { GateModal } from '../auth/GateModal';
import { Toast } from '../../ui/basic/Toast';
import { ReportButton } from '../report/ReportButton';
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readHistory, setReadHistory] = useState<any>(null);
  
  // Real version id for testing (Kancil)
  

  useEffect(() => {
    if (!user || !story) return;
    
    // Check saved status (using a fixed story id for demo)
    
    
    supabase.from('saved_stories').select('*').eq('user_id', user.id).eq('story_id', story.id).single()
      .then(({ data }) => setIsSaved(!!data));
      
    supabase.from('read_history').select('*').eq('user_id', user.id).eq('version_id', story.versionId).single()
      .then(({ data }) => setReadHistory(data));
      
  }, [user, story]);

  const handleRead = () => {
    if (story) {
      navigate(`/baca/` + story.versionId);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setIsGateOpen(true);
      return;
    }
    if (!story) return;
    
    
    
    if (isSaved) {
      await supabase.from('saved_stories').delete().eq('user_id', user.id).eq('story_id', story.id);
      setIsSaved(false);
      setToastMessage('Cerita dihapus dari koleksi');
    } else {
      await supabase.from('saved_stories').insert({ user_id: user.id, story_id: story.id });
      setIsSaved(true);
      setToastMessage('Cerita berhasil disimpan!');
    }
  };

  const content = story ? (
    <div className="flex flex-col h-full gap-4">
      <div className="w-full aspect-video bg-cream flex items-center justify-center overflow-hidden relative shrink-0">
        <Icon name="BookOpen" size={48} className="text-border-light absolute opacity-20" />
        <div className="z-10 font-fredoka font-bold text-teal text-xl opacity-50">
          Cover Image
        </div>
      </div>
      
      <div className="bg-white rounded-t-3xl -mt-6 p-6 relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Chip type={story.type as any} label={story.type.toUpperCase()} className="h-6 px-3 text-xs" />
              {story.region && <Chip type="region" label={story.region} className="h-6 px-3 text-xs" />}
            </div>
            <ReportButton targetType="story" targetId="697008eb-d2b7-4157-ad8f-1ebdfe91bc35" />
          </div>
          <h2 className="text-2xl font-fredoka text-teal mb-2">{story.title}</h2>
        <p className="text-sm text-text-light leading-relaxed">
          Ini adalah ringkasan singkat tentang kisah {story.title} dari {story.region}. 
          Masyarakat lokal mempercayai kisah ini secara turun temurun.
        </p>


        <div className="bg-cream rounded-xl p-4 flex flex-col gap-3 my-4 border border-border-light">
          {story.versionCount > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted flex items-center gap-2 font-nunito"><Icon name="MapPin" size={16} /> Versi</span>
              <span className="text-text-main font-semibold">{story.versionCount} versi</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted flex items-center gap-2 font-nunito"><Icon name="Clock" size={16} /> Durasi</span>
            <span className="text-text-main font-semibold">10 menit baca</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted flex items-center gap-2 font-nunito"><Icon name="Headphones" size={16} /> Mode Dongeng</span>
            <span className="text-text-main font-semibold">{story.dongengReady ? 'Ready' : 'Belum'}</span>
          </div>
        </div>


      <div className="mt-auto pt-4 flex gap-3">
        <Button onClick={handleRead} variant="primary" className="flex-1">
          {readHistory ? `Lanjutkan halaman ${readHistory.last_page_idx}` : 'Lanjut baca'}
        </Button>
        <Button onClick={handleSave} variant="secondary" className={`w-11 !px-0 flex-none ${isSaved ? "text-coral" : ""}`} aria-label="Simpan cerita">
          <Icon name="Bookmark" size={20} className={isSaved ? 'fill-current' : ''} />
        </Button>
      </div>
      
      </div>
      <GateModal 
        isOpen={isGateOpen} 
        onClose={() => setIsGateOpen(false)} 
        message="Masuk untuk menyimpan cerita ke koleksi Anda." 
      />
      <Toast visible={!!toastMessage} message={toastMessage || ""} type="success" onClose={() => setToastMessage(null)} />
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <SidePanel isOpen={!!story} className="absolute top-0 bottom-0 left-0 z-30 h-full">
        <div className="h-full flex flex-col relative">
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup" className="absolute top-4 right-4 w-8 h-8 !px-0 rounded-full z-10"><Icon name="X" size={16} /></Button>
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





