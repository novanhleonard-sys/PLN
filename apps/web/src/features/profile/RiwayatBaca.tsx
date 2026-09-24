import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Button } from '../../ui/basic/Button';
import { Link, useNavigate } from 'react-router-dom';

export function RiwayatBaca() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('read_history')
          .select('*, story:stories(title), version:story_versions(label)')
          .eq('user_id', user.id)
          .order('last_read_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  if (loading) return <div className="text-stone-500 font-nunito p-4">Memuat riwayat...</div>;
  if (error) return <div className="text-red-500 font-nunito p-4">Error: {error}</div>;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-border-light text-center gap-4">
        <p className="text-stone-500 font-nunito">Belum ada cerita yang dibaca.</p>
        <Link to="/">
          <Button>Mulai Eksplorasi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-fredoka text-text-main mb-2">Lanjutkan membaca</h2>
      {history.map((item) => {
        const progress = item.total_pages ? Math.round((item.last_page / item.total_pages) * 100) : 0;
        const isFinished = item.last_page >= item.total_pages;

        return (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-fredoka text-lg text-text-main">
                {item.story?.title || 'Cerita Tidak Diketahui'}
              </h3>
              <p className="text-sm font-nunito text-text-muted">
                {item.version?.label || 'Versi Asli'} &bull; Mode {item.mode}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden w-48 max-w-full">
                  <div className="h-full bg-teal" style={{ width: \\%\ }} />
                </div>
                <span className="text-xs font-nunito text-stone-500">{progress}%</span>
              </div>
            </div>
            
            <div>
              <Button 
                variant={isFinished ? 'secondary' : 'primary'}
                onClick={() => navigate(\/baca/\\)}
              >
                {isFinished ? 'Baca lagi' : 'Lanjutkan'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
