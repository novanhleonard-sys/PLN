import { useMediaQuery } from '../../utils/useMediaQuery';
import { SidePanel } from '../../ui/layers/SidePanel';
import { Sheet } from '../../ui/layers/Sheet';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { type StoryPin } from '../map/dummy-stories';
import { useNavigate } from 'react-router-dom';

interface StoryCardProps {
  story: StoryPin | null;
  onClose: () => void;
}

export function StoryCard({ story, onClose }: StoryCardProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  const handleRead = () => {
    if (story) {
      navigate(`/baca/placeholder`);
    }
  };

  const handleSave = () => {
    alert('Simpan cerita: Fitur akan tersedia di B3');
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
          Lanjut baca
        </Button>
        <Button onClick={handleSave} variant="secondary" className="px-3" aria-label="Simpan cerita">
          <Icon name="Bookmark" size={20} />
        </Button>
      </div>
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
