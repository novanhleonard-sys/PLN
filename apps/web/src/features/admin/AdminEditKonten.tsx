import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContributeForm } from '../contribute/ContributeForm';
import type { ContributeFormData } from '../contribute/ContributeForm';
import { Toast } from '../../ui/basic/Toast';

export function AdminEditKonten() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storyStatus, setStoryStatus] = useState<string>('');
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [initialData, setInitialData] = useState<ContributeFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) return;
      try {
        const { data: story, error: storyError } = await supabase
          .from('stories')
          .select('title, type, region_id, status')
          .eq('id', id)
          .single();

        if (storyError) throw storyError;

        setStoryStatus(story.status);

        const { data: submission } = await supabase
          .from('submissions')
          .select('version_label, body, sources, rights_declared')
          .eq('target_story_id', id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setInitialData({
          title: story.title,
          type: story.type,
          region_id: story.region_id || '',
          version_label: submission?.version_label || 'Versi Admin',
          body: submission?.body || 'Isi cerita belum tersedia dari data pengajuan. Silakan lengkapi di sini.',
          sources: submission?.sources || [{ type: 'buku', citation: '', author: '' }],
          rights_declared: submission?.rights_declared || false
        });

      } catch (err: unknown) {
        console.error(err);
        setToast('Gagal memuat data cerita');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  const handleSubmit = async (data: ContributeFormData) => {
    if (!id) return;
    try {
      const { error: fnError } = await supabase.functions.invoke('submit_contribution', {
        body: {
          title: data.title,
          type: data.type,
          region_id: data.region_id || null,
          version_label: data.version_label,
          body: data.body,
          sources: data.sources,
          rights_declared: data.rights_declared,
        }
      });
      if (fnError) throw new Error(fnError.message);
      
      setToast('Perubahan berhasil dikirim ke antrean.');
      setTimeout(() => navigate('/admin/konten'), 2000);
    } catch (err) {
      console.error(err);
      setToast((err as Error).message || 'Terjadi kesalahan saat menyimpan');
    }
  };

  
  const toggleStatus = async () => {
    if (!id) return;
    setIsTogglingStatus(true);
    try {
      const newStatus = storyStatus === 'published' ? 'unpublished' : 'published';
      const { error } = await supabase.from('stories').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setStoryStatus(newStatus);
      setToast('Status berhasil diubah menjadi ' + newStatus);
    } catch (err: unknown) {
      setToast((err as Error).message || 'Gagal mengubah status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-nunito animate-pulse">Memuat data...</div>;
  }

  return (
    <div className="w-full relative z-10 font-nunito bg-cream">
            <div className="mb-6 bg-white p-6 rounded-xl border border-border-light shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-fredoka font-bold text-stone-800">Edit Cerita</h2>
          <p className="text-stone-500 text-sm mt-1">
            Perbarui isi cerita. Mengirim form ini akan memasukkan revisi ke antrean sistem AI.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${storyStatus === 'published' ? 'bg-teal-100 text-teal-dark' : 'bg-stone-200 text-stone-600'}`}>
            {storyStatus}
          </span>
          <button 
            onClick={toggleStatus} 
            disabled={isTogglingStatus}
            className="px-4 py-2 bg-stone-800 text-stone-100 rounded-full font-bold text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {storyStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="-mx-4 md:-mx-8">
        {initialData && (
          <ContributeForm 
            initialData={initialData} 
            isEditMode={true} 
            onSubmitOverride={handleSubmit} 
            onCancel={() => navigate('/admin/konten')} 
          />
        )}
      </div>

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}
