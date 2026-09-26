import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContributeForm } from '../contribute/ContributeForm';
import type { ContributeFormData } from '../contribute/ContributeForm';
import { Toast } from '../../ui/basic/Toast';
import { Trash } from 'lucide-react';

export function AdminEditKonten() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [storyStatus, setStoryStatus] = useState<string>('');
  const [storyTier, setStoryTier] = useState<number>(4);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isTogglingTier, setIsTogglingTier] = useState(false);
  
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [initialData, setInitialData] = useState<ContributeFormData | null>(null);
  const [storyData, setStoryData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('title, type, region_id, status, tier')
        .eq('id', id)
        .single();

      if (storyError) throw storyError;
      
      setStoryData(story);
      setStoryStatus(story.status);
      setStoryTier(story.tier);

      const { data: vers, error: versError } = await supabase
        .from('story_versions')
        .select('id, label, body, sources, created_at')
        .eq('story_id', id)
        .order('created_at', { ascending: false });
        
      if (versError) throw versError;
      
      setVersions(vers || []);
      
      if (vers && vers.length > 0) {
        setSelectedVersionId(vers[0].id);
        populateForm(story, vers[0]);
      } else {
        populateForm(story, null);
      }
    } catch (err: unknown) {
      console.error(err);
      setToast((err as Error).message || 'Gagal memuat data cerita');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (story: any, version: any) => {
    setInitialData({
      title: story.title,
      type: story.type,
      region_id: story.region_id || '',
      version_label: version?.label || 'Versi Admin',
      body: version?.body || '',
      sources: version?.sources || [{ type: 'buku', citation: '', author: '' }],
      rights_declared: true
    });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vId = e.target.value;
    setSelectedVersionId(vId);
    const ver = versions.find(v => v.id === vId);
    if (ver && storyData) {
      populateForm(storyData, ver);
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

  const updateTier = async (newTier: number) => {
    if (!id) return;
    setIsTogglingTier(true);
    try {
      const { error } = await supabase.from('stories').update({ tier: newTier }).eq('id', id);
      if (error) throw error;
      setStoryTier(newTier);
      setToast('Tier berhasil diubah menjadi Tier ' + newTier);
    } catch (err: unknown) {
      setToast((err as Error).message || 'Gagal mengubah tier');
    } finally {
      setIsTogglingTier(false);
    }
  };

  const handleSubmit = async (data: ContributeFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const { error: storyErr } = await supabase.from('stories').update({
        title: data.title,
        type: data.type,
        region_id: data.region_id || null
      }).eq('id', id);
      if (storyErr) throw storyErr;
      
      if (selectedVersionId) {
        const { error: verErr } = await supabase.from('story_versions').update({
          label: data.version_label,
          body: data.body,
          sources: data.sources
        }).eq('id', selectedVersionId);
        if (verErr) throw verErr;
      }
      
      setToast('Perubahan berhasil ditumpuk (overwrite) ke versi ini.');
      setTimeout(() => navigate('/admin/konten'), 2000);
    } catch (err: unknown) {
      console.error(err);
      setToast((err as Error).message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const isLastVersion = versions.length <= 1;
    const msg = isLastVersion 
      ? 'Hanya ada 1 versi. Yakin ingin MENGHAPUS KESELURUHAN CERITA INI secara permanen?' 
      : 'Yakin ingin menghapus VERSI INI?';
      
    if (!confirm(msg)) return;
    
    try {
      if (isLastVersion) {
        const { error } = await supabase.from('stories').delete().eq('id', id);
        if (error) throw error;
        setToast('Cerita berhasil dihapus.');
        navigate('/admin/konten');
      } else {
        if (!selectedVersionId) return;
        const { error } = await supabase.from('story_versions').delete().eq('id', selectedVersionId);
        if (error) throw error;
        setToast('Versi berhasil dihapus.');
        fetchStory();
      }
    } catch (err: unknown) {
      setToast((err as Error).message || 'Gagal menghapus');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-nunito animate-pulse">Memuat data...</div>;
  }

  return (
    <div className="w-full relative z-10 font-nunito bg-cream">
      <div className="mb-6 bg-white p-6 rounded-xl border border-border-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-fredoka font-bold text-stone-800">Edit Cerita</h2>
          <p className="text-stone-500 text-sm mt-1">
            Revisi ini akan <strong>menumpuk (overwrite)</strong> konten yang ada.
          </p>
        </div>
        <div className="shrink-0 flex items-center flex-wrap gap-3">
          
          {versions.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-500">Pilih Versi:</label>
              <div className="relative">
                <select 
                  value={selectedVersionId}
                  onChange={handleVersionChange}
                  className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal appearance-none pr-8 cursor-pointer"
                >
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>{v.label} ({new Date(v.created_at).toLocaleDateString()})</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-stone-500">Tier:</label>
            <div className="relative">
              <select 
                value={storyTier}
                onChange={(e) => updateTier(Number(e.target.value))}
                disabled={isTogglingTier}
                className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal appearance-none pr-8 cursor-pointer disabled:opacity-50"
              >
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
                <option value={4}>Tier 4</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">▼</div>
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${storyStatus === 'published' ? 'bg-teal-100 text-teal-dark' : 'bg-stone-200 text-stone-600'}`}>
            {storyStatus}
          </span>
          <button 
            onClick={toggleStatus} 
            disabled={isTogglingStatus}
            className="px-4 py-1.5 bg-stone-800 text-stone-100 rounded-lg font-bold text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {storyStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>

          <button 
            onClick={handleDelete}
            className="p-1.5 ml-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
            title={versions.length <= 1 ? "Hapus Cerita" : "Hapus Versi"}
          >
            <Trash size={18} />
          </button>
        </div>
      </div>

      <div className="-mx-4 md:-mx-8">
        {initialData && (
          <ContributeForm 
            key={selectedVersionId}
            initialData={initialData} 
            isEditMode={true} 
            onSubmitOverride={handleSubmit} 
            onCancel={() => navigate('/admin/konten')} 
          />
        )}
      </div>

      {isSaving && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-stone-800 text-white px-6 py-3 rounded-2xl shadow-xl font-bold font-nunito animate-pulse">
            Menyimpan perubahan...
          </div>
        </div>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}