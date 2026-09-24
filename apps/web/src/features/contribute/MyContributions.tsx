import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { StatusLabel } from '../../ui/components/StatusLabel';
import { Link } from 'react-router-dom';

export const MyContributions = () => {
  const { user } = useAuth();
  
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['my_contributions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) return <div className="p-4 text-text-muted">Memuat kontribusi...</div>;

  return (
    <div className="space-y-4">
      {submissions?.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-border-light border-dashed">
          <p className="text-text-muted mb-4">Anda belum memiliki kontribusi cerita.</p>
        </div>
      ) : (
        submissions?.map(sub => (
          <Link key={sub.id} to={`/kontribusi/${sub.id}`} className="block p-4 border border-border-light rounded-2xl hover:border-teal transition-colors bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-text-main font-fredoka text-lg">{sub.title}</h3>
                <p className="text-sm text-text-light">{sub.version_label}</p>
              </div>
              <StatusLabel status={sub.status as any} />
            </div>
            {sub.status === 'rejected' && sub.reject_reason && (
              <p className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded-lg">{sub.reject_reason}</p>
            )}
          </Link>
        ))
      )}
    </div>
  );
};

