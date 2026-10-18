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

// -- Version Picker View --
// -- Main Story Card --
export function StoryCard({ story, onClose }: StoryCardProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditPromptOpen, setIsEditPromptOpen] = useState(false);
  const [storyVersions, setStoryVersions] = useState<any[]>([]);
  
  const [isReportPromptOpen, setIsReportPromptOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Version picker state
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset picker when story changes
  useEffect(() => {
      }, [story?.id]);

  useEffect(() => {
    if (!user || !story) return;
    supabase.from('saved_stories').select('*').eq('user_id', user.id).eq('story_id', story.id).single()
      .then(({ data }) => setIsSaved(!!data));
    
  }, [user, story]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleRead = async () => {
    if (!story) return;
    navigate(`/baca/${story.versionId}`);
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
      try { await navigator.share({ title: story.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setToastMessage('Tautan disalin ke papan klip');
    }
  };

  const [editActionType, setEditActionType] = useState<'select_action' | 'edit_text' | 'contribute_image' | 'contribute_audio'>('select_action');

  const handleOpenEditPrompt = async () => {
    setIsMenuOpen(false);
    if (!user) return setIsGateOpen(true);
    if (story) {
      const { data } = await supabase.from('story_versions').select('id, created_at, status, label').eq('story_id', story.id).order('created_at', { ascending: false });
      if (data) setStoryVersions(data);
    } else {
      setStoryVersions([]);
    }
    setEditActionType('select_action');
    setIsEditPromptOpen(true);
  };

  const goToEdit = async (versionId: string | null) => {
    setIsEditPromptOpen(false);
    if (!user) return setIsGateOpen(true);
    const { data: dbStory } = await supabase.from('stories').select('title, type, region_id').eq('id', story?.id).single();
    let bodyText = '';
    let versionLabel = '';
    if (versionId) {
      const { data: dbVersion } = await supabase.from('story_versions').select('body').eq('id', versionId).single();
      bodyText = dbVersion?.body || '';
      versionLabel = 'Revisi ' + (new Date().toISOString().split('T')[0]);
    }
    navigate('/kontribusi', { state: { initialData: {
      target_story_id: story?.id,
      title: dbStory?.title || story?.title,
      type: dbStory?.type || story?.type,
      region_id: dbStory?.region_id || '',
      version_label: versionLabel,
      body: bodyText,
      sources: [{ type: 'buku', citation: '', author: '' }],
      rights_declared: false
    }}});
  };

  const handleReport = () => {
    setIsMenuOpen(false);
    if (!user) return setIsGateOpen(true);
    setReportReason("");
    setIsReportPromptOpen(true);
  };

  const submitReport = async () => {
    if (!user || !story || !reportReason.trim()) return;
    await supabase.from('reports').insert({ user_id: user.id, target_type: 'story', target_id: story.id, reason: reportReason.trim() });
    setIsReportPromptOpen(false);
    setToastMessage('Laporan berhasil dikirim');
  };

  const content = story ? (
    (
      <div className="flex flex-col h-full bg-white relative">
        {/* Cover Area */}
        <div className="w-full aspect-square md:aspect-video bg-[#fdfaf3] flex flex-col items-center justify-center relative shrink-0">
          {story.cover ? (
              <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
            ) : (
              <>
                <Icon name="BookOpen" size={48} className="text-[#e8e4db] absolute opacity-50" />
                <div className="z-10 font-fredoka font-bold text-[#8fbab8] text-xl opacity-70">Cover Image</div>
              </>
            )}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-t-3xl -mt-6 p-6 relative z-10 flex-1 flex flex-col shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
          {/* Header: Chip & Menu */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-[#dfa024] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {story.type}
              </div>
              {story.region && (
                <div className="bg-stone-100 text-stone-600 border border-stone-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {story.region}
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 rounded-full bg-[#fdfaf3] text-stone-500 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <Icon name="EllipsisVertical" size={18} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-100 rounded-xl shadow-lg py-1 z-50">
                  <button onClick={handleOpenEditPrompt} className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                    <Icon name="Pen" size={16} className="text-stone-400" /> Edit cerita
                  </button>
                  <button onClick={handleReport} className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                      <Icon name="Flag" size={16} className="text-stone-400" /> Laporkan cerita
                    </button>
                    <button onClick={() => { setIsMenuOpen(false); setIsAboutOpen(true); }} className="w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                      <Icon name="Info" size={16} className="text-stone-400" /> Tentang
                    </button>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-fredoka font-bold text-[#1a7f84] mb-3 leading-tight">{story.title}</h2>
          <p className="text-[15px] text-stone-600 leading-relaxed font-nunito">
            {story.synopsis || `Ini adalah ringkasan singkat tentang kisah ${story.title} dari ${story.region || 'Nusantara'}. Masyarakat lokal mempercayai kisah ini secara turun temurun.`}
          </p>

          <div className="bg-[#fdfaf3] rounded-2xl p-4 flex flex-col gap-3 my-5 border border-[#f3eee4]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="MapPin" size={16} className="text-stone-400" /> Versi</span>
              <span className="text-stone-700 font-bold font-nunito">{story.versionCount} versi</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="Clock" size={16} className="text-stone-400" /> Durasi</span>
              <span className="text-stone-700 font-bold font-nunito">{story.duration} menit baca</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 flex items-center gap-2 font-nunito"><Icon name="Headphones" size={16} className="text-stone-400" /> Mode Dongeng</span>
              <span className="text-stone-700 font-bold font-nunito">{story.dongengReady ? 'Siap' : 'Belum'}</span>
            </div>
          </div>

          <div className="mt-auto pt-2 flex gap-3">
            <Button onClick={handleRead} variant="primary" className="flex-1 bg-[#1a7f84] hover:bg-[#136367] text-white font-bold h-12 rounded-xl text-base">
              {'Lanjut baca'}
            </Button>
            <button onClick={handleShare} className="w-12 h-12 flex-none flex items-center justify-center rounded-xl border border-stone-200 text-teal hover:bg-stone-50 transition-colors">
              <Icon name="Share2" size={20} />
            </button>
            <button onClick={handleSave} className={cn("w-12 h-12 flex-none flex items-center justify-center rounded-xl border border-stone-200 transition-colors", isSaved ? "text-coral border-coral/20 bg-coral/5" : "text-teal hover:bg-stone-50")}>
              <Icon name="Bookmark" size={20} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>

        {/* Edit & Contribute Prompt Dialog */}
        {isEditPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl font-nunito border border-stone-100 animate-in fade-in zoom-in-95 duration-200">
              {editActionType === 'select_action' ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-fredoka font-bold text-xl text-stone-800">
                      Kontribusi & Edit Cerita
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Pilih jenis kontribusi yang ingin Anda berikan untuk kisah <span className="font-semibold text-stone-700">{story?.title}</span>:
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {/* Option 1: Edit Teks */}
                    <button
                      type="button"
                      onClick={() => {
                        if (storyVersions.length > 1) {
                          setEditActionType('edit_text');
                        } else {
                          goToEdit(storyVersions[0]?.id || story?.versionId || null);
                        }
                      }}
                      className="p-3.5 rounded-2xl border-2 border-stone-100 hover:border-teal/40 bg-stone-50/60 hover:bg-teal/5 flex items-start gap-3.5 text-left transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon name="Pen" size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-stone-800 block group-hover:text-teal transition-colors">
                          Edit Teks Cerita
                        </span>
                        <span className="text-xs text-stone-500 leading-snug block mt-0.5">
                          Sunting isi cerita tertulis atau buat versi cerita baru dari daerah Anda.
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Kontribusi Gambar */}
                    <button
                      type="button"
                      onClick={() => {
                        if (storyVersions.length > 1) {
                          setEditActionType('contribute_image');
                        } else {
                          setIsEditPromptOpen(false);
                          navigate(`/kontribusi-media/${storyVersions[0]?.id || story?.versionId}/gambar`);
                        }
                      }}
                      className="p-3.5 rounded-2xl border-2 border-stone-100 hover:border-amber-400/50 bg-stone-50/60 hover:bg-amber-50/40 flex items-start gap-3.5 text-left transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon name="Palette" size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-stone-800 block group-hover:text-amber-700 transition-colors">
                          Kontribusi Gambar (Artis)
                        </span>
                        <span className="text-xs text-stone-500 leading-snug block mt-0.5">
                          Ajukan karya ilustrasi visual buatan Anda sendiri untuk setiap adegan.
                        </span>
                      </div>
                    </button>

                    {/* Option 3: Kontribusi Suara */}
                    <button
                      type="button"
                      onClick={() => {
                        if (storyVersions.length > 1) {
                          setEditActionType('contribute_audio');
                        } else {
                          setIsEditPromptOpen(false);
                          navigate(`/kontribusi-media/${storyVersions[0]?.id || story?.versionId}/suara`);
                        }
                      }}
                      className="p-3.5 rounded-2xl border-2 border-stone-100 hover:border-rose-400/50 bg-stone-50/60 hover:bg-rose-50/40 flex items-start gap-3.5 text-left transition group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon name="Mic" size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-stone-800 block group-hover:text-rose-700 transition-colors">
                          Kontribusi Suara (Pengisi Suara)
                        </span>
                        <span className="text-xs text-stone-500 leading-snug block mt-0.5">
                          Rekam suara pembacaan cerita Anda untuk mode dongeng bersuara.
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                    <Button onClick={() => setIsEditPromptOpen(false)} variant="ghost" className="w-full text-stone-500 text-xs">
                      Batal
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setEditActionType('select_action')}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
                    >
                      <Icon name="ArrowLeft" size={14} />
                    </button>
                    <div>
                      <h3 className="font-fredoka font-bold text-lg text-stone-800 leading-tight">
                        {editActionType === 'edit_text' && 'Pilih Versi untuk Edit Teks'}
                        {editActionType === 'contribute_image' && 'Pilih Versi untuk Kontribusi Gambar'}
                        {editActionType === 'contribute_audio' && 'Pilih Versi untuk Kontribusi Suara'}
                      </h3>
                      <p className="text-xs text-stone-500">
                        Cerita ini memiliki {storyVersions.length} versi. Pilih versi target:
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {storyVersions.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setIsEditPromptOpen(false);
                          if (editActionType === 'edit_text') {
                            goToEdit(v.id);
                          } else if (editActionType === 'contribute_image') {
                            navigate(`/kontribusi-media/${v.id}/gambar`);
                          } else if (editActionType === 'contribute_audio') {
                            navigate(`/kontribusi-media/${v.id}/suara`);
                          }
                        }}
                        className="w-full p-3 rounded-xl border border-stone-200 hover:border-teal/50 hover:bg-teal/5 text-left transition flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-sm text-stone-800 block">
                            {v.label || 'Versi Utama'}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Dibuat: {new Date(v.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-stone-400" />
                      </button>
                    ))}
                  </div>

                  {editActionType === 'edit_text' && (
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <Button onClick={() => goToEdit(null)} variant="secondary" className="w-full text-xs">
                        + Buat Versi Teks Baru
                      </Button>
                    </div>
                  )}

                  <div className="mt-2 flex justify-end">
                    <Button onClick={() => setIsEditPromptOpen(false)} variant="ghost" className="w-full text-stone-500 text-xs">
                      Tutup
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* About Dialog */}
          {isAboutOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <h3 className="font-fredoka font-bold text-lg text-stone-800 mb-4">Sumber Cerita</h3>
                <div className="max-h-60 overflow-y-auto font-nunito text-sm text-stone-600 flex flex-col gap-3 pr-2 mb-4">
                  {story.sources && story.sources.length > 0 ? (
                    story.sources.map((src: any, idx: number) => (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <div className="font-bold text-stone-700 mb-1">{src.author || 'Sumber'}</div>
                        <div className="text-stone-500 text-xs uppercase tracking-wider mb-1">{src.type || 'Lainnya'}</div>
                        <div className="break-all">{src.citation?.startsWith('http') ? <a href={src.citation} target="_blank" rel="noreferrer" className="text-teal hover:underline">{src.citation}</a> : src.citation}</div>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-stone-400">Data sumber tidak tersedia untuk cerita ini.</p>
                  )}
                </div>
                <Button onClick={() => setIsAboutOpen(false)} variant="ghost" className="w-full bg-stone-100">Tutup</Button>
              </div>
            </div>
          )}

          {/* Report Dialog */}
        {isReportPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-fredoka font-bold text-lg text-stone-800 mb-2">Laporkan Cerita</h3>
              <p className="text-sm text-stone-500 mb-4">Alasan melaporkan cerita ini?</p>
              <textarea className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-teal resize-none mb-4" rows={3} value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Masukkan alasan..." />
              <div className="flex gap-2">
                <Button onClick={() => setIsReportPromptOpen(false)} variant="ghost" className="flex-1">Batal</Button>
                <Button onClick={submitReport} variant="primary" className="flex-1 !bg-red-500 hover:!bg-red-600 !border-red-500 text-white">Kirim</Button>
              </div>
            </div>
          </div>
        )}

        <GateModal isOpen={isGateOpen} onClose={() => setIsGateOpen(false)} message="Masuk untuk berinteraksi dengan cerita." />
        <Toast visible={!!toastMessage} message={toastMessage || ""} type="success" onClose={() => setToastMessage(null)} />
      </div>
    )
  ) : null;

  if (isDesktop) {
    return (
      <SidePanel isOpen={!!story} className="absolute top-0 bottom-0 left-0 z-[70] h-full border-r border-stone-200">
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
