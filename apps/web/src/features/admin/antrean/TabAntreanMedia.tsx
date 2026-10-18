import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../ui/basic/Button';
import { Modal } from '../../../ui/layers/Modal';
import { Toast } from '../../../ui/basic/Toast';
import { Icon } from '../../../ui/basic/Icon';
import { cn } from '../../../utils/cn';

export function TabAntreanMedia() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState('');

  // Modal states
  const [selectedContrib, setSelectedContrib] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  // Fetch pending media submissions
  const { data: mediaSubmissions, isLoading } = useQuery({
    queryKey: ['admin_media_submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_contributions')
        .select(`
          *,
          profiles:user_id(display_name),
          story_versions:story_version_id(
            id, label, body,
            story:stories(id, title, slug, type, region:regions(name))
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Approve mutation via RPC
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('approve_media_contribution', { p_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setToast(`Karya berhasil disetujui! (${data?.applied_items || 0} media diperbarui).`);
      setSelectedContrib(null);
      queryClient.invalidateQueries({ queryKey: ['admin_media_submissions'] });
    },
    onError: (err: any) => {
      setToast('Gagal menyetujui: ' + (err.message || 'Error'));
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('media_contributions')
        .update({
          status: 'rejected',
          reject_reason: rejectReason.trim(),
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      setToast('Karya telah ditolak');
      setIsRejectModalOpen(false);
      setSelectedContrib(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin_media_submissions'] });
    },
    onError: (err: any) => {
      setToast('Gagal menolak: ' + (err.message || 'Error'));
    }
  });

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

  return (
    <div className="space-y-6 font-nunito">
      {isLoading ? (
        <div className="p-8 animate-pulse flex flex-col gap-4">
          <div className="h-24 bg-stone-100 rounded-2xl w-full" />
          <div className="h-24 bg-stone-100 rounded-2xl w-full" />
        </div>
      ) : !mediaSubmissions?.length ? (
        <div className="p-12 text-center text-stone-500 bg-stone-50 border border-stone-200 border-dashed rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <Icon name="CircleCheck" size={24} />
          </div>
          <p className="font-bold text-stone-700">Tidak ada pengajuan karya media.</p>
          <p className="text-xs text-stone-400 mt-1">Semua karya gambar dan suara dari artis telah ditinjau.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {mediaSubmissions.map((contrib: any) => {
            const isImage = contrib.media_type === 'image';
            const story = contrib.story_versions?.story;
            const items = contrib.items || [];

            return (
              <div 
                key={contrib.id} 
                className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn(
                      "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border",
                      isImage 
                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                      {isImage ? 'Karya Ilustrasi Gambar' : 'Rekaman Narasi Suara'}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-stone-100 text-stone-600 border border-stone-200">
                      {items.length} Adegan
                    </span>
                  </div>

                  <h3 className="font-bold font-fredoka text-xl text-stone-800 leading-tight">
                    {story?.title || 'Cerita Nusantara'}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1">
                    Versi: <span className="font-bold text-stone-700">{contrib.story_versions?.label || 'Utama'}</span>
                    {' &bull; '}
                    Pengirim: <span className="font-bold text-teal">{contrib.profiles?.display_name || 'Artis'}</span>
                    {' &bull; '}
                    Atribusi: <span className="font-semibold text-stone-700">"{contrib.credits}"</span>
                  </p>

                  {contrib.note && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 mt-2 max-w-2xl">
                      <span className="font-bold text-stone-500 mr-1">Catatan:</span> {contrib.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button onClick={() => setSelectedContrib(contrib)} className="whitespace-nowrap font-bold">
                    Tinjau & Bandingkan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedContrib && (
        <Modal isOpen={true} onClose={() => setSelectedContrib(null)} className="max-w-4xl !p-0">
          <div className="flex flex-col h-[88vh]">
            {/* Header */}
            <div className="flex-none p-6 border-b border-stone-200 bg-white/90 backdrop-blur z-10 flex items-start justify-between mr-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider",
                    selectedContrib.media_type === 'image' ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  )}>
                    {selectedContrib.media_type === 'image' ? 'Ilustrasi Gambar' : 'Rekaman Suara'}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(selectedContrib.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="text-2xl font-fredoka font-bold text-stone-800">
                  {selectedContrib.story_versions?.story?.title}
                </h3>
                <p className="text-xs text-stone-500">
                  Versi: <strong>{selectedContrib.story_versions?.label}</strong> &bull; 
                  Artis: <strong>{selectedContrib.profiles?.display_name}</strong> &bull; 
                  Atribusi: <strong className="text-teal">"{selectedContrib.credits}"</strong>
                </p>
              </div>

              <Button
                variant="secondary"
                className="text-xs py-1.5 px-3 h-auto gap-1 text-stone-600"
                onClick={() => setIsTextModalOpen(true)}
              >
                <Icon name="BookOpen" size={14} className="text-teal" />
                Baca Naskah Cerita
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Membandingkan seluruh {selectedContrib.items?.length || 0} adegan:</span>
                <span className="font-bold text-teal">Kiri: Karya Artis Baru &bull; Kanan: AI / Sebelumnya</span>
              </div>

              {selectedContrib.items?.map((item: any, idx: number) => {
                const isImage = selectedContrib.media_type === 'image';
                const artistUrl = getPublicUrl(item.file_path);

                return (
                  <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-bold text-sm text-stone-800">
                        Adegan {idx + 1}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        ID: {item.target_id?.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Artist Submitted Media */}
                      <div className="p-3 bg-teal/5 border border-teal/20 rounded-xl space-y-2">
                        <span className="text-xs font-bold text-teal flex items-center gap-1.5">
                          <Icon name="Sparkles" size={14} />
                          Karya Diajukan Artis ({selectedContrib.credits})
                        </span>

                        {isImage ? (
                          <div className="aspect-video bg-black/5 rounded-lg overflow-hidden border border-teal/30">
                            <img src={artistUrl} alt={`Adegan ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="pt-2">
                            <audio src={artistUrl} controls className="w-full" preload="metadata" />
                            {item.duration_ms && (
                              <span className="text-[11px] text-stone-400 mt-1 block">
                                Durasi: {Math.round(item.duration_ms / 1000)} detik
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info / Description */}
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 flex flex-col justify-center">
                        <span className="text-xs font-bold text-stone-500">
                          Catatan Penerapan
                        </span>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          Saat disetujui, file ini akan menggantikan aset adegan #{idx + 1} di database dan pembaca cerita akan melihat karya seniman ini.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Action Footer */}
            <div className="flex-none p-5 border-t border-stone-200 bg-white shadow-lg z-20 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                variant="secondary"
                className="!text-red-600 !border-red-200 hover:!bg-red-50 w-full sm:w-auto font-bold"
                onClick={() => setIsRejectModalOpen(true)}
              >
                Tolak Pengajuan
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedContrib(null)}
                  className="w-full sm:w-auto"
                >
                  Tutup
                </Button>
                <Button
                  className="w-full sm:w-auto font-bold px-6 shadow-md shadow-teal/20"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(selectedContrib.id)}
                >
                  {approveMutation.isPending ? 'Menerapkan...' : 'Setujui & Terapkan ke Cerita'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedContrib && (
        <Modal isOpen={true} onClose={() => setIsRejectModalOpen(false)} className="max-w-md p-6">
          <div className="flex flex-col gap-4 text-stone-800 font-nunito">
            <h3 className="text-xl font-fredoka font-bold text-red-600">
              Tolak Karya Media
            </h3>
            <p className="text-xs text-stone-500">
              Berikan alasan penolakan agar artis/pengisi suara dapat memperbaiki karyanya:
            </p>

            <textarea
              className="w-full border-2 border-stone-200 rounded-xl p-3 outline-none focus:border-red-500 min-h-[100px] text-sm"
              placeholder="Contoh: Resolusi gambar adegan 3 terlalu buram / audio adegan 2 terdengar bising..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex gap-3 justify-end mt-2">
              <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
                Batal
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 font-bold"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate(selectedContrib.id)}
              >
                {rejectMutation.isPending ? 'Menolak...' : 'Yakin, Tolak'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Full Text Reference Modal */}
      {isTextModalOpen && selectedContrib && (
        <Modal isOpen={true} onClose={() => setIsTextModalOpen(false)} className="max-w-2xl p-6">
          <div className="flex flex-col gap-4 font-nunito max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-lg font-fredoka font-bold text-stone-800">
                Naskah Cerita Lengkap
              </h3>
              <button 
                onClick={() => setIsTextModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center"
              >
                <Icon name="X" size={14} />
              </button>
            </div>

            <div className="overflow-y-auto pr-2 text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedContrib.story_versions?.body || 'Teks cerita tidak tersedia.'}
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <Button onClick={() => setIsTextModalOpen(false)} variant="primary">
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
