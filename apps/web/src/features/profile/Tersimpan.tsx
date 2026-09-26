import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/basic/Button';
import { Bookmark } from 'lucide-react';

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
        .select('*, story:stories(id, title, type, region_id)')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
        
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

  if (isLoading) return <div className="p-8 text-center font-nunito text-stone-500">Memuat simpanan...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito h-full">
      <h2 className="text-2xl font-fredoka font-bold text-stone-800">Tersimpan</h2>

      {!saved || saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
          <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mb-4">
            <Bookmark size={32} />
          </div>
          <p className="text-stone-500">Belum ada cerita yang disimpan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {saved.map(item => {
            const story = item.story as any;
            return (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-teal transition-colors" onClick={() => navigate(`/cerita/${story?.id}`)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {story?.type || 'cerita'}
                    </span>
                  </div>
                  <h3 className="font-fredoka font-bold text-stone-800 text-lg truncate">
                    {story?.title}
                  </h3>
                </div>
                
                <div className="shrink-0 ml-4">
                  <Button variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMutation.mutate(story?.id);
                    }}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full text-coral shadow-sm"
                  >
                    <Bookmark size={20} className="fill-current" />
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