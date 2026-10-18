import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { GateModal } from '../auth/GateModal';
import { Button } from '../../ui/basic/Button';
import { Input } from '../../ui/basic/Input';
import { Icon } from '../../ui/basic/Icon';
import { AudioUploader } from '../../ui/form/AudioUploader';
import { Toast } from '../../ui/basic/Toast';
import { Modal } from '../../ui/layers/Modal';
import { cn } from '../../utils/cn';

interface SlotItem {
  id: string; // scene_id or page_id
  idx: number;
  textSnippet: string;
  description?: string;
  currentAiPath?: string | null;
  uploadedPath?: string;
  durationMs?: number;
}

export function MediaContributionForm() {
  const { versionId, type } = useParams<{ versionId: string; type: string }>();
  const isImage = type === 'gambar';
  const mediaType = isImage ? 'image' : 'audio';

  const navigate = useNavigate();
  const { user } = useAuth();

  const [gateOpen, setGateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFullTextOpen, setIsFullTextOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomImage(null);
    };
    if (zoomImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [zoomImage]);

  // Form State
  const [credits, setCredits] = useState('');
  const [note, setNote] = useState('');
  const [rightsDeclared, setRightsDeclared] = useState(false);
  const [uploadedSlots, setUploadedSlots] = useState<Record<string, { path: string; durationMs?: number }>>({});

  // 1. Fetch Version and Story info
  const { data: versionData, isLoading: isLoadingVersion } = useQuery({
    queryKey: ['story_version_detail', versionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_versions')
        .select(`
          id, label, body, created_at, status,
          story:stories(id, title, slug, type, synopsis, region:regions(name))
        `)
        .eq('id', versionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!versionId
  });

  // 2. Fetch Slots (Scenes or Pages)
  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['media_slots', versionId, type],
    queryFn: async () => {
      if (!versionId) return [];

      // Query adaptations to get the base adaptation and pages
      const { data: adaptations } = await supabase
        .from('adaptations')
        .select('id, age_band, language')
        .eq('version_id', versionId);

      // Prioritize Indonesian original adaptation
      const baseAdaptation = 
        adaptations?.find((a: any) => a.age_band === 'asli' && a.language === 'id') ||
        adaptations?.find((a: any) => a.language === 'id') ||
        adaptations?.find((a: any) => a.age_band === 'asli') ||
        adaptations?.[0];

      const pagesMap: Record<string, string> = {};
      let pagesList: any[] = [];
      if (baseAdaptation) {
        const { data: pages } = await supabase
          .from('pages')
          .select('id, idx, text, scene_id, page_audio(*), scene:scenes(description)')
          .eq('adaptation_id', baseAdaptation.id)
          .order('idx', { ascending: true });

        if (pages) {
          pagesList = pages;
          pages.forEach((p: any) => {
            if (p.scene_id) {
              pagesMap[p.scene_id] = p.text;
            }
          });
        }
      }

      if (isImage) {
        // Slots are scenes
        const { data: scenes, error } = await supabase
          .from('scenes')
          .select('*')
          .eq('version_id', versionId)
          .order('idx', { ascending: true });

        if (error) throw error;

        return (scenes || []).map((sc: any) => ({
          id: sc.id,
          idx: sc.idx,
          textSnippet: pagesMap[sc.id] || sc.description || 'Adegan cerita.',
          description: sc.description,
          currentAiPath: sc.image_path
        } as SlotItem));
      } else {
        // Slots are pages with audio
        return pagesList.map((p: any) => ({
          id: p.id,
          idx: p.idx,
          textSnippet: p.text,
          description: p.scene?.description,
          currentAiPath: p.page_audio?.[0]?.path
        } as SlotItem));
      }
    },
    enabled: !!versionId
  });

  // 3. Fetch Existing Submission if any
  const { data: existingSubmission } = useQuery({
    queryKey: ['existing_media_submission', versionId, mediaType, user?.id],
    queryFn: async () => {
      if (!user || !versionId) return null;
      const { data } = await supabase
        .from('media_contributions')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_version_id', versionId)
        .eq('media_type', mediaType)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!versionId
  });

  // Prepopulate if previously rejected or drafting
  useEffect(() => {
    if (existingSubmission) {
      if (existingSubmission.credits) setCredits(existingSubmission.credits);
      if (existingSubmission.note) setNote(existingSubmission.note);
      if (existingSubmission.items && Array.isArray(existingSubmission.items)) {
        const map: Record<string, { path: string; durationMs?: number }> = {};
        existingSubmission.items.forEach((item: any) => {
          if (item.target_id && item.file_path) {
            map[item.target_id] = { path: item.file_path, durationMs: item.duration_ms };
          }
        });
        setUploadedSlots(map);
      }
    }
  }, [existingSubmission]);

  // Require auth
  useEffect(() => {
    if (!user) {
      setGateOpen(true);
    }
  }, [user]);

  const totalSlots = slotsData?.length || 0;
  const uploadedCount = useMemo(() => {
    if (!slotsData) return 0;
    return slotsData.filter((slot: SlotItem) => !!uploadedSlots[slot.id]?.path).length;
  }, [slotsData, uploadedSlots]);

  const isComplete = totalSlots > 0 && uploadedCount === totalSlots;

  const handleSlotImageUpload = (slotId: string, path: string) => {
    setUploadedSlots(prev => ({
      ...prev,
      [slotId]: { path }
    }));
  };

  const handleSlotAudioUpload = (slotId: string, path: string, durationMs?: number) => {
    setUploadedSlots(prev => ({
      ...prev,
      [slotId]: { path, durationMs }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setGateOpen(true);

    if (!isComplete) {
      setToastMessage(`Harap lengkapi seluruh ${totalSlots} adegan sebelum mengirimkan.`);
      return;
    }

    if (!credits.trim()) {
      setToastMessage('Harap cantumkan nama artis / atribusi karya.');
      return;
    }

    if (!rightsDeclared) {
      setToastMessage('Harap setujui pernyataan hak cipta karya.');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = (slotsData || []).map((slot: SlotItem) => ({
        target_id: slot.id,
        idx: slot.idx,
        file_path: uploadedSlots[slot.id].path,
        duration_ms: uploadedSlots[slot.id].durationMs || null
      }));

      const { error } = await supabase
        .from('media_contributions')
        .upsert({
          user_id: user.id,
          story_version_id: versionId,
          media_type: mediaType,
          credits: credits.trim(),
          note: note.trim() || null,
          items: items,
          status: 'pending',
          reject_reason: null,
          reviewed_by: null,
          reviewed_at: null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,story_version_id,media_type'
        });

      if (error) throw error;

      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error('Gagal mengajukan karya:', err);
      setToastMessage('Gagal mengajukan: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPublicUrl = (path: string | null | undefined, isAudio = false) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('artist-contributions/') || path.startsWith('submissions/')) {
      return supabase.storage.from('story-media').getPublicUrl(path).data.publicUrl;
    }
    if (isAudio || path.endsWith('.ogg') || path.endsWith('.mp3') || path.startsWith('page_audio_')) {
      return supabase.storage.from('audio').getPublicUrl(path).data.publicUrl;
    }
    return supabase.storage.from('story-media').getPublicUrl(path).data.publicUrl;
  };

  if (isLoadingVersion || isLoadingSlots) {
    return (
      <div className="min-h-screen bg-[#fdfaf3] flex flex-col items-center justify-center p-6 font-nunito">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-stone-600 font-bold">Memuat data cerita dan adegan...</p>
      </div>
    );
  }

  const story = (versionData as any)?.story;

  return (
    <div className="min-h-screen bg-[#fcf9f2] font-nunito flex flex-col pb-32">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
              title="Kembali"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-fredoka font-bold text-stone-800 leading-tight">
                  {story?.title || 'Kontribusi Media'}
                </h1>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal/10 text-teal border border-teal/20">
                  {versionData?.label || 'Versi Utama'}
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-2">
                <span>{isImage ? 'Karya Ilustrasi Gambar' : 'Rekaman Narasi Suara'}</span>
                <span>&bull;</span>
                <span className={cn("font-bold", isComplete ? "text-green-600" : "text-amber-600")}>
                  {uploadedCount} dari {totalSlots} adegan terlengkapi
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3 h-auto gap-1.5 border-stone-200 text-stone-700 hover:bg-stone-100"
              onClick={() => setIsFullTextOpen(true)}
            >
              <Icon name="BookOpen" size={14} className="text-teal" />
              <span className="hidden sm:inline">Baca Teks Lengkap</span>
            </Button>
          </div>
        </div>

        {/* Top Progress bar */}
        <div className="w-full bg-stone-100 h-1 mt-3">
          <div 
            className="bg-teal h-full transition-all duration-300"
            style={{ width: `${totalSlots > 0 ? (uploadedCount / totalSlots) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 flex flex-col gap-6">
        {/* Status Alert if previously submitted */}
        {existingSubmission && (
          <div className={cn(
            "p-4 rounded-2xl border flex items-start gap-3 shadow-sm",
            existingSubmission.status === 'pending' ? "bg-amber-50/80 border-amber-200 text-amber-900" :
            existingSubmission.status === 'rejected' ? "bg-red-50/80 border-red-200 text-red-900" :
            "bg-teal-50 border-teal-200 text-teal-900"
          )}>
            <div className="pt-0.5">
              <Icon 
                name={existingSubmission.status === 'pending' ? 'Clock' : existingSubmission.status === 'rejected' ? 'TriangleAlert' : 'Check'} 
                size={18} 
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-bold">
                {existingSubmission.status === 'pending' && 'Pengajuan Anda sedang ditinjau admin.'}
                {existingSubmission.status === 'rejected' && 'Pengajuan sebelumnya ditolak oleh admin.'}
                {existingSubmission.status === 'approved' && 'Karya Anda telah disetujui dan diterapkan pada cerita ini!'}
              </p>
              {existingSubmission.status === 'rejected' && existingSubmission.reject_reason && (
                <p className="mt-1 text-xs opacity-90">
                  Alasan penolakan: <span className="font-semibold">{existingSubmission.reject_reason}</span>. Anda dapat merevisi karya dan mengajukannya kembali.
                </p>
              )}
            </div>
          </div>
        )}



        {/* Slots List */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka font-bold text-lg text-stone-800">
              Daftar Adegan ({slotsData?.length || 0})
            </h3>
            <span className="text-xs text-stone-500">
              {uploadedCount} dari {totalSlots} terisi
            </span>
          </div>

          {slotsData?.map((slot: SlotItem, index: number) => {
            const isSlotFilled = !!uploadedSlots[slot.id]?.path;
            const userUploadedPath = uploadedSlots[slot.id]?.path;

            return (
              <div 
                key={slot.id}
                className={cn(
                  "bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm",
                  isSlotFilled ? "border-teal/30 ring-1 ring-teal/20" : "border-stone-200"
                )}
              >
                {/* Slot Header */}
                <div className="bg-[#fcfaf6] border-b border-stone-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-sm text-stone-800">
                      Adegan {index + 1}
                    </h4>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    isSlotFilled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                  )}>
                    <Icon name={isSlotFilled ? "Check" : "Clock"} size={12} />
                    {isSlotFilled ? "Karya Terunggah" : "Wajib Diisi"}
                  </span>
                </div>

                <div className="p-5 grid md:grid-cols-12 gap-5">
                  {/* Left: Narration & Context */}
                  <div className="md:col-span-6 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Teks Narasi Adegan
                      </span>
                      <div className="p-3.5 bg-[#fdfaf3] rounded-xl border border-[#f3eee4] text-stone-700 text-sm leading-relaxed">
                        {slot.textSnippet}
                      </div>
                    </div>

                    {slot.description && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                          Deskripsi Visual / Konteks
                        </span>
                        <p className="text-xs text-stone-500 italic bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                          {slot.description}
                        </p>
                      </div>
                    )}

                    {/* Current AI reference preview */}
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Versi AI Saat Ini (Referensi)
                      </span>
                      {isImage ? (
                        <div className="flex items-center gap-3">
                          {slot.currentAiPath ? (
                            <div 
                              className="relative group cursor-zoom-in shrink-0"
                              onClick={() => setZoomImage(getPublicUrl(slot.currentAiPath))}
                              title="Klik untuk memperbesar"
                            >
                              <img 
                                src={getPublicUrl(slot.currentAiPath)} 
                                alt="Referensi AI" 
                                className="w-16 h-16 rounded-lg object-cover border border-stone-200 bg-stone-100 group-hover:ring-2 group-hover:ring-teal/60 transition" 
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition backdrop-blur-[0.5px]">
                                <Icon name="Maximize2" size={16} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-dashed border-stone-200 flex items-center justify-center text-stone-400 text-[10px] text-center p-1 shrink-0">
                              Belum ada AI
                            </div>
                          )}
                          <span className="text-xs text-stone-400">
                            Karya baru Anda akan menggantikan gambar AI ini saat disetujui. Klik gambar untuk memperbesar.
                          </span>
                        </div>
                      ) : (
                        <div>
                          {slot.currentAiPath ? (
                            <audio 
                              src={getPublicUrl(slot.currentAiPath, true)} 
                              controls 
                              className="w-full h-8" 
                              preload="metadata"
                            />
                          ) : (
                            <span className="text-xs text-stone-400 italic">Belum ada audio AI untuk adegan ini.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Artist Upload Area */}
                  <div className="md:col-span-6 bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 flex flex-col justify-center">
                    <span className="text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                      <Icon name="Image" size={14} className="text-teal" />
                      {isImage ? `Unggah Ilustrasi Adegan ${index + 1}` : `Unggah Rekaman Suara Adegan ${index + 1}`}
                    </span>

                    {isImage ? (
                      <SlotImageUploader 
                        currentPath={userUploadedPath}
                        onUpload={(path) => handleSlotImageUpload(slot.id, path)}
                        onZoom={(url) => setZoomImage(url)}
                      />
                    ) : (
                      <AudioUploader
                        currentAudioPath={userUploadedPath}
                        onUpload={(path, durationMs) => handleSlotAudioUpload(slot.id, path, durationMs)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Attribution & Declaration Form */}
        <section className="bg-white border border-[#e8e4db] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-fredoka font-bold text-lg text-stone-800 flex items-center gap-2">
            <Icon name="Award" size={20} className="text-amber-500" />
            Informasi Artis & Hak Cipta
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Nama Artis / Narator (Atribusi Wajib)"
              placeholder="Contoh: Rian Pratama atau Studio Warna Nusantara"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-stone-700">Catatan untuk Admin (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: Dibuat menggunakan teknik cat air manual"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal text-sm font-nunito"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input 
              type="checkbox" 
              checked={rightsDeclared} 
              onChange={(e) => setRightsDeclared(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-teal focus:ring-teal border-stone-300 cursor-pointer"
            />
            <span className="text-xs text-stone-600 leading-relaxed font-nunito select-none">
              Saya menyatakan bahwa seluruh materi ({isImage ? 'gambar ilustrasi' : 'rekaman suara'}) yang saya ajukan adalah karya asli saya sendiri atau memiliki izin pemanfaatan penuh, dan saya menyetujui lisensi{' '}
              <a 
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-teal font-bold underline hover:text-teal-dark inline-flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                CC BY-SA 4.0
                <Icon name="ExternalLink" size={12} />
              </a>
              {' '}dengan atribusi nama saya di Peta Legenda Nusantara.
            </span>
          </label>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 py-4 px-4 md:px-8 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-30">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
              isComplete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              {uploadedCount}/{totalSlots}
            </div>
            <div>
              <p className="font-bold text-stone-800 leading-tight">
                {isComplete ? 'Seluruh adegan telah lengkap!' : `Belum lengkap (${uploadedCount} dari ${totalSlots})`}
              </p>
              <p className="text-xs text-stone-500">
                {isComplete 
                  ? 'Siap diajukan ke antrean moderasi admin.' 
                  : 'Harap lengkapi semua adegan cerita agar tombol aktif.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none border-stone-200 text-stone-600 hover:bg-stone-50"
              onClick={() => navigate(-1)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 sm:flex-none font-bold px-8 shadow-md shadow-teal/20"
              disabled={!isComplete || !credits.trim() || !rightsDeclared || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Mengirimkan...' : `Kirim Karya (${uploadedCount}/${totalSlots})`}
            </Button>
          </div>
        </div>
      </footer>

      {/* Full Story Text Modal */}
      {isFullTextOpen && (
        <Modal isOpen={true} onClose={() => setIsFullTextOpen(false)} className="max-w-2xl max-h-[85vh]">
          <div className="flex flex-col gap-4 font-nunito pr-6">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-xl font-fredoka font-bold text-stone-800">
                {story?.title}
              </h3>
              <p className="text-xs text-stone-500">
                Naskah lengkap versi: <span className="font-bold text-teal">{versionData?.label}</span>
              </p>
            </div>

            <div className="space-y-4 text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {versionData?.body || 'Teks cerita tidak tersedia.'}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <Button onClick={() => setIsFullTextOpen(false)} variant="primary">
                Tutup Naskah
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Modal isOpen={true} onClose={() => {}} className="max-w-md p-6 text-center">
          <div className="flex flex-col items-center gap-4 font-nunito">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-1">
              <Icon name="Check" size={32} />
            </div>
            <h3 className="text-2xl font-fredoka font-bold text-stone-800">
              Karya Berhasil Diajukan!
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Terima kasih atas kontribusi karya {isImage ? 'gambar' : 'suara'} Anda untuk kisah <strong>{story?.title}</strong>. 
              Karya Anda sekarang berada dalam status <strong>Menunggu Persetujuan Admin</strong> di antrean moderasi.
            </p>
            <div className="w-full flex flex-col gap-2.5 mt-2">
              <Button 
                onClick={() => navigate('/profil/kontribusi')} 
                className="w-full font-bold"
              >
                Lihat di Profil Kontribusi
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Kembali ke Peta
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Image Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={zoomImage} 
              alt="Perbesar Gambar" 
              className="max-w-[92vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200" 
            />
            <div className="mt-3 inline-flex items-center gap-1.5 bg-black/60 text-white/80 text-xs px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
              <Icon name="X" size={14} />
              <span>Klik di mana saja untuk kembali</span>
            </div>
          </div>
        </div>
      )}

      <GateModal 
        isOpen={gateOpen} 
        onClose={() => { setGateOpen(false); navigate(-1); }} 
        message="Silakan masuk untuk mengajukan karya gambar atau suara ke cerita ini." 
      />
      <Toast visible={!!toastMessage} message={toastMessage || ""} onClose={() => setToastMessage(null)} />
    </div>
  );
}

// Inline Slot Image Uploader helper
function SlotImageUploader({ 
  currentPath, 
  onUpload, 
  onZoom 
}: { 
  currentPath?: string; 
  onUpload: (path: string) => void;
  onZoom?: (url: string) => void;
}) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = currentPath 
    ? (currentPath.startsWith('http') ? currentPath : supabase.storage.from('story-media').getPublicUrl(currentPath).data.publicUrl)
    : null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 10MB.');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'webp';
      const storageName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `artist-contributions/${user.id}/${storageName}`;

      const { error } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;
      onUpload(filePath);
    } catch (err: any) {
      console.error('Upload image failed:', err);
      alert('Gagal mengunggah gambar: ' + (err.message || 'Error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="relative group rounded-xl overflow-hidden border border-teal/30 bg-black/5 aspect-video flex items-center justify-center">
          <img 
            src={preview} 
            alt="Karya Artis" 
            className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition duration-300"
            onClick={() => onZoom?.(preview)}
            title="Klik untuk memperbesar"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition z-10">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onZoom?.(preview); }}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs backdrop-blur-sm transition"
              title="Perbesar Gambar"
            >
              <Icon name="Maximize2" size={14} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              disabled={uploading}
              className="px-2.5 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-bold backdrop-blur-sm transition flex items-center gap-1.5"
              title="Ganti Gambar"
            >
              <Icon name="Upload" size={13} />
              <span>{uploading ? 'Mengunggah...' : 'Ganti'}</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video border-2 border-dashed border-stone-200 hover:border-teal/50 hover:bg-teal/5 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:text-teal transition p-4 group"
        >
          <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-teal/10 flex items-center justify-center text-stone-400 group-hover:text-teal transition">
            <Icon name="ImagePlus" size={20} />
          </div>
          <span className="text-xs font-bold font-nunito text-stone-600 group-hover:text-teal">
            {uploading ? 'Mengunggah...' : 'Pilih atau Tarik File Gambar'}
          </span>
          <span className="text-[10px] text-stone-400">PNG, JPG, WebP (Maks. 10MB)</span>
        </button>
      )}

      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        className="hidden" 
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  );
}
