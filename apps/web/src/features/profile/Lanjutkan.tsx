import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/basic/Button';
import { PlayCircle } from 'lucide-react';

export function Lanjutkan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: history, isLoading } = useQuery({
    queryKey: ['read_history', 'lanjutkan', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('read_history')
        .select('*, story:stories(id, title, type), version:story_versions(id, label)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      // Filter uncompleted stories (last_page < total_pages)
      return data.filter(item => (item.last_page || 1) < (item.total_pages || 10));
    },
    enabled: !!user
  });

  if (isLoading) return <div className="p-8 text-center font-nunito text-stone-500">Memuat...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito h-full">
      <h2 className="text-2xl font-fredoka font-bold text-stone-800">Lanjutkan</h2>
      
      {!history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
          <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mb-4">
            <PlayCircle size={32} />
          </div>
          <p className="text-stone-500">Tidak ada cerita yang sedang dibaca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map(item => {
            const progress = Math.min(100, Math.round(((item.last_page || 1) / (item.total_pages || 10)) * 100));

            return (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-teal/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {(item.story as any)?.type || 'cerita'}
                    </span>
                  </div>
                  <h3 className="font-fredoka font-bold text-stone-800 text-lg truncate">
                    {(item.story as any)?.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-teal min-w-[40px]">{progress}%</span>
                  </div>
                </div>
                
                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button onClick={() => navigate(`/baca/${item.version_id}`)} className="w-full sm:w-auto">
                    Lanjutkan
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
