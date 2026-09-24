import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/basic/Button';
import { Icon } from '../../ui/basic/Icon';

export function Tersimpan() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSaved() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('saved_stories')
          .select('*, story:stories(id, title, type, slug)')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false });

        if (error) throw error;
        setSaved(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [user]);

  const handleUnsave = async (storyId: string) => {
    try {
      await supabase
        .from('saved_stories')
        .delete()
        .eq('user_id', user?.id)
        .eq('story_id', storyId);
      
      setSaved((prev) => prev.filter(s => s.story_id !== storyId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-stone-500 font-nunito p-4">Memuat cerita tersimpan...</div>;
  if (error) return <div className="text-red-500 font-nunito p-4">Error: {error}</div>;

  if (saved.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-border-light text-center gap-4">
        <p className="text-stone-500 font-nunito">Belum ada cerita yang tersimpan.</p>
        <Link to="/">
          <Button>Jelajahi Peta</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-fredoka text-text-main mb-4">Tersimpan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {saved.map((item) => (
          <div key={item.story_id} className="bg-white rounded-xl border border-border-light overflow-hidden flex flex-col">
            <div className="aspect-video bg-stone-100 flex items-center justify-center relative">
              <Icon name="book" className="text-stone-300" size={48} />
              <button 
                onClick={() => handleUnsave(item.story_id)}
                className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                title="Hapus simpanan"
              >
                <Icon name="bookmark-minus" size={16} className="text-text-main" />
              </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <span className="text-xs font-nunito text-teal font-bold uppercase mb-1">
                {item.story?.type || 'cerita'}
              </span>
              <h3 className="font-fredoka text-lg text-text-main leading-tight mb-2">
                {item.story?.title || 'Cerita Tidak Diketahui'}
              </h3>
              <div className="mt-auto pt-4">
                <Link to={\/cerita/\\} className="text-blue-sea text-sm font-nunito font-bold hover:underline">
                  Lihat di Peta &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
