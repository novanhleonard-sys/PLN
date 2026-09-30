import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ContributeForm } from '../contribute/ContributeForm';
import type { ContributeFormData } from '../contribute/ContributeForm';
import { Toast } from '../../ui/basic/Toast';
import { Modal } from '../../ui/layers/Modal';
import { Trash, RefreshCw, EyeOff, Image as ImageIcon, Music, BookOpen, AlertTriangle, Plus } from 'lucide-react';

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

  const [assetStats, setAssetStats] = useState({
    vbExists: false,
    vbRefsCount: 0,
    scenesTotal: 0,
    scenesComplete: 0,
    audioTotal: 0,
    audioComplete: 0
  });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [viewModal, setViewModal] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVersionId) {
      fetchAssetStats(selectedVersionId);
    }
  }, [selectedVersionId]);

  const fetchAssetStats = async (versionId: string) => {
    setLoadingAssets(true);
    try {
      const { data: vb } = await supabase
        .from('story_visual_bibles')
        .select('id, canonical_references(id, name, description, image_path, is_canonical, type)')
        .eq('version_id', versionId)
        .maybeSingle();

      const { data: scenes } = await supabase
        .from('scenes')
        .select('id, idx, image_path, image_prompt, description')
        .eq('version_id', versionId)
        .order('idx');

      const { data: adaptations } = await supabase
        .from('adaptations')
        .select('id, pages(id, page_audio(id))')
        .eq('version_id', versionId);

      let aTotal = 0, aComp = 0;
      adaptations?.forEach((ad: any) => {
        ad.pages?.forEach((p: any) => {
          aTotal++;
          if (p.page_audio?.length > 0) aComp++;
        });
      });

      setAssetDetails({ vb, scenes });
      setAssetStats({
        vbExists: !!vb,
        vbRefsCount: vb?.canonical_references?.length ?? 0,
        scenesTotal: scenes?.length ?? 0,
        scenesComplete: scenes?.filter((s: any) => s.image_path).length ?? 0,
        audioTotal: aTotal,
        audioComplete: aComp
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAssets(false);
    }
  };


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
      rights_declared: true, lat: null, lng: null, synopsis: '', hero_image_path: null, pin_image_path: null, asset_credits: '', force_new_reason: null
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

  const handleRegenerateVB = () => {
    if (confirm('Ini akan memengaruhi canonical references dan scenes. Lanjut?')) {
      setToast('Visual Bible sedang di-regenerate (MOCK)');
    }
  };

  const handleGenerateMissing = () => {
    setToast('Memproses aset yang hilang... (MOCK)');
  };

  const handleHideAsset = () => {
    setToast('Aset disembunyikan (MOCK)');
  };

  const handleDeleteAsset = () => {
    if (confirm('Yakin ingin menghapus aset?')) {
      setToast('Aset dihapus (MOCK)');
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

      {/* Asset Completion Section */}
      <div className="mt-8 bg-white p-6 rounded-xl border border-border-light shadow-sm mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-fredoka font-bold text-stone-800 flex items-center gap-2">
              <BookOpen size={20} className="text-teal" />
              Kelengkapan Asset
            </h3>
            <p className="text-sm text-stone-500 font-nunito mt-1">Status aset untuk versi cerita ini</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleRegenerateVB}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg text-sm font-bold transition-colors"
            >
              <RefreshCw size={14} />
              Regenerate VB
            </button>
            <button 
              onClick={handleGenerateMissing}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm font-bold transition-colors"
            >
              <Plus size={14} />
              Generate Missing
            </button>
            <button 
              onClick={handleHideAsset}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200 rounded-lg text-sm font-bold transition-colors"
            >
              <EyeOff size={14} />
              Hide Asset
            </button>
            <button 
              onClick={handleDeleteAsset}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-colors"
            >
              <Trash size={14} />
              Delete Asset
            </button>
          </div>
        </div>

        {loadingAssets ? (
          <div className="py-8 text-center text-stone-500 animate-pulse font-nunito text-sm">
            Memeriksa status aset...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border-light bg-stone-50/50 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-colors" onClick={() => setViewModal('vb')}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${assetStats.vbExists ? 'bg-teal-100 text-teal-dark' : 'bg-red-100 text-red-600'}`}>
                  <BookOpen size={18} />
                </div>
                <div className="font-bold text-stone-800">Visual Bible</div>
              </div>
              <div className="text-2xl font-black font-fredoka text-stone-800 mt-2">
                {assetStats.vbExists ? 'Tersedia' : 'Kosong'}
              </div>
              <div className="text-xs text-stone-500 mt-1 font-bold">
                {assetStats.vbRefsCount} Canonical References
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border-light bg-stone-50/50 cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-colors" onClick={() => setViewModal('scenes')}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${assetStats.scenesComplete === assetStats.scenesTotal && assetStats.scenesTotal > 0 ? 'bg-teal-100 text-teal-dark' : 'bg-amber-100 text-amber-600'}`}>
                  <ImageIcon size={18} />
                </div>
                <div className="font-bold text-stone-800">Scene Images</div>
              </div>
              <div className="text-2xl font-black font-fredoka text-stone-800 mt-2 flex items-baseline gap-1">
                {assetStats.scenesComplete} <span className="text-base font-bold text-stone-400">/ {assetStats.scenesTotal}</span>
              </div>
              <div className="text-xs text-stone-500 mt-1 font-bold">
                Gambar Ter-generate
              </div>
              {assetStats.scenesTotal > 0 && assetStats.scenesComplete < assetStats.scenesTotal && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 py-1 px-2 rounded-md border border-amber-100">
                  <AlertTriangle size={12} />
                  Belum Lengkap
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border-light bg-stone-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${assetStats.audioComplete === assetStats.audioTotal && assetStats.audioTotal > 0 ? 'bg-teal-100 text-teal-dark' : 'bg-amber-100 text-amber-600'}`}>
                  <Music size={18} />
                </div>
                <div className="font-bold text-stone-800">Audio Narasi</div>
              </div>
              <div className="text-2xl font-black font-fredoka text-stone-800 mt-2 flex items-baseline gap-1">
                {assetStats.audioComplete} <span className="text-base font-bold text-stone-400">/ {assetStats.audioTotal}</span>
              </div>
              <div className="text-xs text-stone-500 mt-1 font-bold">
                Audio Ter-generate
              </div>
              {assetStats.audioTotal > 0 && assetStats.audioComplete < assetStats.audioTotal && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 py-1 px-2 rounded-md border border-amber-100">
                  <AlertTriangle size={12} />
                  Belum Lengkap
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isSaving && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-stone-800 text-white px-6 py-3 rounded-2xl shadow-xl font-bold font-nunito animate-pulse">
            Menyimpan perubahan...
          </div>
        </div>
      )}

      
      {viewModal === 'vb' && (
        <Modal isOpen={true} onClose={() => setViewModal(null)}>
          <h2 className="font-fredoka text-xl font-bold mb-4">Visual Bible & Canonical References</h2>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {!assetDetails?.vb ? <p>Belum ada Visual Bible.</p> : (
              <div className="grid gap-4">
                {assetDetails.vb.canonical_references?.map((ref: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded-lg flex items-start gap-4">
                    {ref.image_path ? (
                      <img src={ref.image_path} alt={ref.name} className="w-24 h-24 object-cover rounded-md" />
                    ) : (
                      <div className="w-24 h-24 bg-stone-200 rounded-md flex items-center justify-center text-xs text-stone-500">No Image</div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-stone-800">{ref.name}</h4>
                        <span className="text-xs text-stone-400 uppercase">{ref.type}</span>
                        {ref.is_canonical && <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-bold">Canonical</span>}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{ref.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {viewModal === 'scenes' && (
        <Modal isOpen={true} onClose={() => setViewModal(null)}>
          <h2 className="font-fredoka text-xl font-bold mb-4">Scene Images</h2>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {!assetDetails?.scenes?.length ? <p>Belum ada Scene.</p> : (
              <div className="grid gap-4">
                {assetDetails.scenes.map((scene: any, idx: number) => (
                  <div key={idx} className="border p-3 rounded-lg flex flex-col gap-2">
                    <div className="font-bold text-sm">Scene {scene.idx}</div>
                    {scene.image_path ? (
                      <img src={scene.image_path} alt="Scene" className="w-full h-auto object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-32 bg-stone-200 rounded-md flex items-center justify-center text-xs text-stone-500">Proses...</div>
                    )}
                    <p className="text-xs text-stone-600 mt-1 italic">{scene.image_prompt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
      
      <Toast visible={!!toast} message={toast} onClose={() => setToast('')} />
    </div>
  );
}