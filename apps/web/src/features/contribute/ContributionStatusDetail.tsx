import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const ContributionStatusDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('submissions').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
  if (!submission) return <div className="p-8 text-center">Kontribusi tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-cream font-nunito p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-border-light p-6 md:p-10 space-y-8">
        <Link to="/profil/kontribusi" className="text-teal font-bold">&larr; Kembali ke Daftar</Link>
        
        <div>
          <h1 className="text-3xl font-fredoka font-bold text-text-main mb-2">{submission.title}</h1>
          <div className="text-text-muted">{submission.version_label}</div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg border-b border-border-light pb-2">Linimasa Status</h3>
          <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">
             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-teal text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  ?
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border-light bg-stone-50 shadow-sm">
                  <div className="font-bold text-text-main">Status Saat Ini</div>
                  <div className="text-sm text-text-muted capitalize">{submission.status.replace('_', ' ')}</div>
                </div>
             </div>
          </div>
        </div>

        {submission.reject_reason && (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
            <h4 className="font-bold mb-2">Alasan Penolakan:</h4>
            <p className="text-sm">{submission.reject_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

