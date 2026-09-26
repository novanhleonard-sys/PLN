import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { SidePanel } from '../../ui/layers/SidePanel';
import { Sheet } from '../../ui/layers/Sheet';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';
import { type StoryPin } from '../map/useStories';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthStore';
import { GateModal } from '../auth/GateModal';
import { Toast } from '../../ui/basic/Toast';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';

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
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);
  const [storyVersions, setStoryVersions] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !story) return;
    supabase.from('saved_stories').select('*').eq('user_id', user.id).eq('story_id', story.id).single()
      .then(({ data }) => setIsSaved(!!data));
      
    supabase.from('read_history').select('*').eq('user_id', user.id).eq('version_id', story.versionId).single()
      .then(({ data }) => setReadHistory(data));
  }, [user, story]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleRead = () => {
    if (story) navigate(`/baca/` + story.versionId);
  };

  const handleSave = async () => {
    if (!user) return setIsGateOpen(true);
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

  const handleShare = async () => {
    if (!story) return;
    const url = `${window.location.origin}/cerita/${story.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
      } catch (e) {
        // ignore abort
      }
    } else {
      await navigator.clipboard.writeText(url);
      setToastMessage('Tautan disalin ke papan klip');
    }
  };

  const handleOpenEditPrompt = async () => {
    setIsMenuOpen(false);
    if (!user) return setIsGateOpen(true);
    
    if (story && story.versionCount > 1) {
      const { data } = await supabase.from('story_versions').select('id, created_at, status').eq('story_id', story.id).order('created_at', { ascending: false });
      if (data) setStoryVersions(data);
    } else {
      setStoryVersions([]);
    }
    setIsEditPromptOpen(true);
  };

  const goToEdit = async (versionId: string | null) => {
    setIsEditPromptOpen(false);
    if (!user) return setIsGateOpen(true);
    
    // Fetch current story data to prefill
    const { data: dbStory } = await supabase.from('stories').select('title, type, region_id').eq('id', story?.id).single();
    
    let bodyText = '';
    let versionLabel = '';
    
    if (versionId) {
      const { data: dbVersion } = await supabase.from('story_versions').select('body').eq('id', versionId).single();
      bodyText = dbVersion?.body || '';
      versionLabel = 'Revisi ' + (new Date().toISOString().split('T')[0]);
    }

    const initialData = {
      target_story_id: story?.id,
      title: dbStory?.title || story?.title,
      type: dbStory?.type || story?.type,
      region_id: dbStory?.region_id || '',
      version_label: versionLabel,
      body: bodyText,
      sources: [{ type: 'buku', citation: '', author: '' }],
      rights_declared: false
    };

    navigate('/kontribusi', { state: { initialData } });
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    if (!user) return setIsGateOpen(true);
    // Ideally we'd open a report dialog, for now let's just create one or prompt
    const reason = window.prompt("Alasan melaporkan cerita ini?");
    if (reason) {
      supabase.from('reports').insert({
        user_id: user.id,
        target_type: 'story',
        target_id: story?.id,
        reason: reason
      }).then(() => setToastMessage('Laporan berhasil dikirim'));
    }
  };

  const content = story ? (
    <div className="flex flex-col h-full bg-white relative">
      {/* Cover Area */}
      <div className="w-full aspect-square md:aspect-video bg-[#fdfaf3] flex flex-col items-center justify-center relative shrink-0">
        <Icon name="BookOpen" size={48} className="text-[#e8e4db] absolute opacity-50" />
        <div className="z-10 font-fredoka font-bold text-[#8fbab8] text-xl opacity-70">
          Cover Image
        </div>
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-t-3xl -mt-6 p-6 relative z-10 flex-1 flex flex-col shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        
        {/* Header: Chip & Menu */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-[#dfa024] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {story.type}
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="w-8 h-8 rounded-full bg-[#fdfaf3] text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <Icon name="EllipsisVertical" size={18} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-100 rounded-xl shadow-lg py-1 z-50">
                <button 
                  onClick={handleOpenEditPrompt}
                  className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Icon name="Pen" size={16} className="text-stone-400" /> Edit cerita
                </button>
                <button 
                  onClick={handleReport}
                  className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Icon name="Flag" size={16} className="text-stone-400" /> Laporkan cerita
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Desc */}
        <h2 className="text-2xl font-fredoka font-bold text-[#1a7f84] mb-3 leading-tight">{story.title}</h2>
        <p className="text-[15px] text-stone-600 leading-relaxed font-nunito">
          Ini adalah ringkasan singkat tentang kisah {story.title} dari {story.region || 'Nusantara'}. 
          Masyarakat lokal mempercayai kisah ini secara turun temurun.
        </p>

        {/* Metadata Box */}
        <div className="bg-[#fdfaf3] rounded-2xl p-4 flex flex-col gap-3 my-5 border border-[#f3eee4]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="MapPin" size={16} className="text-stone-400" /> Versi</span>
            <span className="text-stone-700 font-bold font-nunito">{story.versionCount} versi</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="Clock" size={16} className="text-stone-400" /> Durasi</span>
            <span className="text-stone-700 font-bold font-nunito">10 menit baca</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="Headphones" size={16} className="text-stone-400" /> Mode Dongeng</span>
            <span className="text-stone-700 font-bold font-nunito">{story.dongengReady ? 'Ready' : 'Belum'}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-2 flex gap-3">
          <Button onClick={handleRead} variant="primary" className="flex-1 bg-[#1a7f84] hover:bg-[#136367] text-white font-bold h-12 rounded-xl text-base">
            {readHistory ? `Lanjut baca (Hal ${readHistory.last_page_idx})` : 'Lanjut baca'}
          </Button>
          <button onClick={handleShare} className="w-12 h-12 flex-none flex items-center justify-center rounded-xl border border-stone-200 text-teal hover:bg-stone-50 transition-colors">
            <Icon name="Share2" size={20} />
          </button>
          <button onClick={handleSave} className={cn("w-12 h-12 flex-none flex items-center justify-center rounded-xl border border-stone-200 transition-colors", isSaved ? "text-coral border-coral/20 bg-coral/5" : "text-teal hover:bg-stone-50")}>
            <Icon name="Bookmark" size={20} className={isSaved ? 'fill-current' : ''} />
          </button>
        </div>
      
      </div>

      {/* Edit Prompt Dialog */}
      {isEditPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-fredoka font-bold text-lg text-stone-800 mb-2">Edit Cerita</h3>
            <p className="text-sm text-stone-500 mb-6">Apakah Anda ingin memperbaiki versi yang mana?</p>
            <div className="flex flex-col gap-3">
              {storyVersions.length > 1 ? (
                <>
                  {storyVersions.map((v) => (
                    <Button key={v.id} onClick={() => goToEdit(v.id)} variant="primary" className="w-full h-auto py-2">
                      Edit Versi {new Date(v.created_at).toLocaleDateString()} {v.status === 'published' ? '(Aktif)' : ''}
                    </Button>
                  ))}
                  <Button onClick={() => goToEdit(null)} variant="secondary" className="w-full">Buat versi lain</Button>
                </>
              ) : (
                <>
                  <Button onClick={() => goToEdit(story!.versionId || 'default')} variant="primary" className="w-full">Edit versi ini</Button>
                  <Button onClick={() => goToEdit(null)} variant="secondary" className="w-full">Buat versi lain</Button>
                </>
              )}
              <Button onClick={() => setIsEditPromptOpen(false)} variant="ghost" className="w-full mt-2">Batal</Button>
            </div>
          </div>
        </div>
      )}

      <GateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} message="Masuk untuk berinteraksi dengan cerita." />
      <Toast visible={!!toastMessage} message={toastMessage || ""} type="success" onClose={() => setToastMessage(null)} />
    </div>
  ) : null;

  if (isDesktop) {
    return (
      <SidePanel isOpen={!!story} className="absolute top-0 bottom-0 left-0 z-30 h-full border-r border-stone-200">
        <div className="h-full flex flex-col relative">
          <button onClick={onClose} aria-label="Tutup" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 text-stone-600 hover:bg-black/20 z-20">
            <Icon name="X" size={16} />
          </button>
          {content}
        </div>
      </SidePanel>
    );
  }

  return (
    <Sheet isOpen={!!story} onClose={onClose} noPadding hideCloseButton>
      {content}
    </Sheet>
  );
}
