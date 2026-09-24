import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';

export function Tersimpan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: saved, isLoading } = useQuery({
    queryKey: ['saved_stories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_stories')
        .select(`
          *,
          story:stories(id, title, type, region_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const removeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) return;
      const { error } = await supabase.from('saved_stories').delete().eq('user_id', user.id).eq('story_id', storyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved_stories', user?.id] });
    }
  });

  if (isLoading) return <div className="p-8 text-center font-nunito text-text-muted">Memuat simpanan...</div>;
  if (!saved || saved.length === 0) return <div className="p-8 text-center font-nunito text-text-muted bg-white rounded-2xl border border-border-light border-dashed">Belum ada cerita yang disimpan.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {saved.map(item => {
        const story = item.story as any;
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-teal transition-colors" onClick={() => navigate(`/cerita/${story?.id}`)}>
            <div className="aspect-[4/3] bg-cream flex items-center justify-center relative">
               <span className="text-4xl opacity-20">??</span>
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMutation.mutate(story?.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full text-coral shadow-sm backdrop-blur-sm"
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
               </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {story?.type || 'cerita'}
                </span>
              </div>
              <h3 className="font-fredoka font-bold text-text-main leading-tight line-clamp-2">
                {story?.title}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
