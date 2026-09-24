import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/basic/Button';

export function RiwayatBaca() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery({
    queryKey: ['read_history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('read_history')
        .select(`
          *,
          story:stories(id, title, type, region_id),
          version:story_versions(id, label)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) return <div className="p-8 text-center font-nunito text-text-muted">Memuat riwayat...</div>;
  if (!history || history.length === 0) return <div className="p-8 text-center font-nunito text-text-muted bg-white rounded-2xl border border-border-light border-dashed">Belum ada riwayat baca.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {history.map(item => {
        const isFinished = false; // We can derive this if we know total pages
        const progress = Math.min(100, Math.round(((item.last_page_idx || 1) / 10) * 100)); // dummy total pages for now

        return (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-border-light shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-16 h-16 bg-cream rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl opacity-50">??</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {(item.story as any)?.type || 'cerita'}
                </span>
              </div>
              <h3 className="font-fredoka font-bold text-text-main text-lg truncate">
                {(item.story as any)?.title}
              </h3>
              <p className="text-sm font-nunito text-text-muted">
                {(item.version as any)?.label || 'Versi Asli'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden w-48 max-w-full">
                  <div className="h-full bg-teal" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-nunito text-stone-500">{progress}%</span>
              </div>
            </div>
            
            <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <Button 
                variant={isFinished ? 'secondary' : 'primary'}
                onClick={() => navigate(`/baca/${item.version_id}`)}
                className="w-full"
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
