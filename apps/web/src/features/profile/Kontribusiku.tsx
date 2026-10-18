import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Badge, Card } from '../../ui/basic/BadgeCard';
import { Link } from 'react-router-dom';
import { PenTool, Palette, Mic, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Kontribusiku() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'text' | 'media'>('text');
  
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['my_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: mediaContributions, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['my_media_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('media_contributions')
        .select(`
          *,
          story_versions:story_version_id(
            id, label,
            story:stories(id, title, slug)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const isLoading = isLoadingSubmissions || isLoadingMedia;

  if (isLoading) return <div className="p-8 text-center font-nunito text-stone-500">Memuat kontribusi...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Kontribusiku</h2>

        {/* Tab switchers */}
        <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600">
          <button
            onClick={() => setTab('text')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition",
              tab === 'text' ? "bg-white text-teal shadow-sm" : "hover:text-stone-800"
            )}
          >
            Cerita Tertulis ({submissions?.length || 0})
          </button>
          <button
            onClick={() => setTab('media')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition flex items-center gap-1.5",
              tab === 'media' ? "bg-white text-teal shadow-sm" : "hover:text-stone-800"
            )}
          >
            <span>Karya Media ({mediaContributions?.length || 0})</span>
          </button>
        </div>
      </div>

      {tab === 'text' ? (
        !submissions || submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
            <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mb-4">
              <PenTool size={32} />
            </div>
            <p className="text-stone-500">Belum ada cerita tertulis yang Anda kirimkan.</p>
            <Link to="/kontribusi" className="mt-4 px-6 py-2 bg-teal text-white rounded-full font-bold hover:bg-teal-dark transition-colors">
              Kirim Cerita Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-end mb-2">
              <Link to="/kontribusi" className="px-4 py-2 bg-teal text-white text-sm rounded-full font-bold hover:bg-teal-dark transition-colors">
                + Cerita Baru
              </Link>
            </div>
            {submissions.map(sub => (
              <Link key={sub.id} to={`/kontribusi/${sub.id}`} className="block">
                <Card className="p-4 hover:border-teal transition-colors shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-stone-800 font-fredoka text-lg">{sub.title}</h3>
                      <p className="text-sm text-stone-500">{sub.version_label}</p>
                    </div>
                    <Badge variant={sub.status === "approved" ? "success" : sub.status === "rejected" ? "error" : sub.status === "pending" ? "warning" : "default"}>
                      {sub.status}
                    </Badge>
                  </div>
                  {sub.status === 'rejected' && sub.reject_reason && (
                    <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg">{sub.reject_reason}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* MEDIA CONTRIBUTIONS TAB */
        !mediaContributions || mediaContributions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
            <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mb-4">
              <Palette size={32} />
            </div>
            <p className="text-stone-500">Belum ada karya gambar atau rekaman suara yang Anda ajukan.</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">
              Buka cerita apa saja di peta, klik tombol "Edit Cerita", lalu pilih Kontribusi Gambar atau Kontribusi Suara.
            </p>
            <Link to="/" className="mt-4 px-6 py-2 bg-teal text-white rounded-full font-bold hover:bg-teal-dark transition-colors text-sm">
              Jelajahi Cerita di Peta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {mediaContributions.map((media: any) => {
              const isImage = media.media_type === 'image';
              const story = media.story_versions?.story;
              const version = media.story_versions;
              const itemCount = media.items?.length || 0;

              return (
                <div key={media.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-teal transition space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        isImage ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {isImage ? <Palette size={20} /> : <Mic size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                            isImage ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                          )}>
                            {isImage ? 'Karya Ilustrasi' : 'Narasi Suara'}
                          </span>
                          <span className="text-xs text-stone-400">
                            {itemCount} Adegan
                          </span>
                        </div>
                        <h3 className="font-bold text-stone-800 font-fredoka text-lg leading-tight">
                          {story?.title || 'Cerita Nusantara'}
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Versi: <span className="font-semibold text-stone-700">{version?.label || 'Utama'}</span> &bull; 
                          Atribusi: <span className="font-semibold text-stone-700">"{media.credits}"</span>
                        </p>
                      </div>
                    </div>

                    <Badge variant={media.status === "approved" ? "success" : media.status === "rejected" ? "error" : "warning"}>
                      {media.status === 'pending' ? 'Menunggu Review' : media.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </Badge>
                  </div>

                  {media.status === 'rejected' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle size={14} />
                        <span>Catatan Penolakan Admin:</span>
                      </div>
                      <p className="pl-5 leading-relaxed">{media.reject_reason || 'Karya belum memenuhi standar moderasi.'}</p>
                      <div className="pt-1 flex justify-end">
                        <Link 
                          to={`/kontribusi-media/${media.story_version_id}/${isImage ? 'gambar' : 'suara'}`}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                        >
                          Perbaiki & Ajukan Ulang
                        </Link>
                      </div>
                    </div>
                  )}

                  {media.status === 'approved' && (
                    <div className="p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle size={14} />
                        Karya aktif ditampilkan untuk pembaca cerita ini!
                      </span>
                      {story?.slug && (
                        <Link to={`/cerita/${story.slug}`} className="font-bold underline hover:text-green-950">
                          Buka Cerita &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
