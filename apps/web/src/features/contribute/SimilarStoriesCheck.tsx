import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../ui/basic/Icon';
import { Button } from '../../ui/basic/Button';

interface SimilarStoriesCheckProps {
  title: string;
  onSelectAction: (action: 'read' | 'add_version' | 'new', targetStoryId?: string, forceReason?: string) => void;
}

export function SimilarStoriesCheck({ title, onSelectAction }: SimilarStoriesCheckProps) {
  const [similarStories, setSimilarStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'list' | 'reason' | 'selected'>('list');
  const [reason, setReason] = useState('');
  const [selectedStory, setSelectedStory] = useState<any>(null);

  useEffect(() => {
    if (title.length < 4) {
      setSimilarStories([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      // Search for similar stories
      const searchTitle = title.trim().split(' ').map(w => w + ':*').join(' | ');
      const { data } = await supabase
        .from('stories')
        .select('id, title, regions(name), story_versions(id)')
        .textSearch('title', searchTitle, { type: 'websearch' })
        .limit(3);
      
      // Fallback to ilike if textSearch fails or returns empty
      if (!data || data.length === 0) {
        const { data: fallback } = await supabase
          .from('stories')
          .select('id, title, regions(name), story_versions(id)')
          .ilike('title', `%${title}%`)
          .limit(3);
        setSimilarStories(fallback || []);
      } else {
        setSimilarStories(data);
      }
      setLoading(false);
      
      // Reset mode if title changes significantly
      if (mode === 'reason' && similarStories.length > 0) {
        setMode('list');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title]);

  if (title.length < 4 || (similarStories.length === 0 && !loading)) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col gap-3 font-nunito animate-in fade-in zoom-in-95">
      {mode === 'list' && (
        <>
          <div className="flex items-start gap-3">
            <Icon name="TriangleAlert" className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-stone-800 text-sm">Cerita Serupa Ditemukan</h4>
              <p className="text-sm text-stone-600 mt-1">Kami menemukan cerita yang mungkin sama dengan yang Anda maksud. Judul sama tidak selalu berarti ceritanya persis sama.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            {loading ? (
              <div className="text-xs text-stone-400 p-2">Mencari...</div>
            ) : (
              similarStories.map(s => (
                <div key={s.id} className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                  <div>
                    <div className="font-bold text-stone-800 text-sm">{s.title}</div>
                    <div className="text-xs text-stone-500 flex gap-2 mt-0.5">
                      <span>{(s.regions as any)?.name || 'Nusantara'}</span>
                      <span>&bull;</span>
                      <span>{s.story_versions?.length || 1} versi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button"
                      onClick={() => window.open(`/cerita/${s.id}`, '_blank')}
                      className="px-3 py-1.5 text-xs font-bold text-teal bg-teal/10 hover:bg-teal/20 rounded-lg transition-colors"
                    >
                      Baca
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedStory(s);
                        setMode('selected');
                        onSelectAction('add_version', s.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-teal hover:bg-teal/90 rounded-lg transition-colors"
                    >
                      Tambah Versi
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!loading && similarStories.length > 0 && (
            <button 
              type="button"
              onClick={() => setMode('reason')}
              className="text-xs text-stone-500 hover:text-stone-800 underline self-start mt-1"
            >
              Cerita saya benar-benar baru, bukan versi dari cerita di atas
            </button>
          )}
        </>
      )}

      {mode === 'reason' && (
        <div className="flex flex-col gap-3">
          <div className="font-bold text-stone-800 text-sm">Lanjutkan sebagai Cerita Baru</div>
          <p className="text-xs text-stone-600">Berikan alasan singkat mengapa ini berbeda dari cerita yang sudah ada (misal: "Tokoh dan alurnya sama sekali berbeda meskipun judul mirip").</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white min-h-[80px]"
            placeholder="Alasan singkat..."
          />
          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setMode('list')} variant="secondary" className="h-8 text-xs px-3 rounded-lg">Kembali</Button>
            <Button type="button" onClick={() => onSelectAction('new', undefined, reason)} disabled={!reason.trim()} className="h-8 text-xs px-3 rounded-lg bg-orange-500 hover:bg-orange-600 border-none text-white">Lanjutkan</Button>
          </div>
        </div>
      )}

      {mode === 'selected' && selectedStory && (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-1">Menambah Versi Untuk</span>
            <span className="font-bold text-teal text-sm flex items-center gap-2">
              <Icon name="Link2" size={14} /> {selectedStory.title}
            </span>
            <span className="text-xs text-stone-600 mt-1">Kontribusi Anda akan ditambahkan sebagai versi baru (sumber berbeda) untuk kisah ini.</span>
          </div>
          <button type="button" onClick={() => {
            setMode('list');
            setSelectedStory(null);
            onSelectAction('new'); // Reset to default
          }} className="p-2 hover:bg-orange-100 rounded-full text-stone-500">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
