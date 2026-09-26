import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Badge, Card } from '../../ui/basic/BadgeCard';
import { Link } from 'react-router-dom';
import { PenTool } from 'lucide-react';

export function Kontribusiku() {
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

  if (isLoading) return <div className="p-8 text-center font-nunito text-stone-500">Memuat...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito h-full">
      <h2 className="text-2xl font-fredoka font-bold text-stone-800">Kontribusiku</h2>

      {!submissions || submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
          <div className="w-16 h-16 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mb-4">
            <PenTool size={32} />
          </div>
          <p className="text-stone-500">Belum ada cerita yang dikirimkan.</p>
          <Link to="/kontribusi" className="mt-4 px-6 py-2 bg-teal text-white rounded-full font-bold hover:bg-teal-dark transition-colors">
            Kirim Cerita Baru
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-end mb-2">
            <Link to="/kontribusi" className="px-4 py-2 bg-teal text-white text-sm rounded-full font-bold hover:bg-teal-dark transition-colors">
              + Cerita Baru
            </Link>
          </div>
          {submissions.map(sub => (
            <Link key={sub.id} to={`/kontribusi/${sub.id}`} className="block">
              <Card className="p-4 hover:border-teal transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-stone-800 font-fredoka text-lg">{sub.title}</h3>
                    <p className="text-sm text-stone-500">{sub.version_label}</p>
                  </div>
                  <Badge variant={sub.status === "approved" ? "success" : sub.status === "rejected" ? "error" : sub.status === "pending" ? "warning" : "default"}>
                    {sub.status}
                  </Badge>
                </div>
                {sub.status === 'rejected' && sub.reject_reason && (
                  <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg">{sub.reject_reason}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
