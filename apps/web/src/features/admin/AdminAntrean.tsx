import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';


export const AdminAntrean = () => {
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-submissions'] });
    },
  });

  if (isLoading) return <div className="p-8">Memuat antrean...</div>;

  return (
    <div className="p-8 font-nunito max-w-5xl mx-auto">
      <h1 className="text-2xl font-fredoka font-semibold mb-6">Antrean Submission</h1>
      <div className="flex flex-col gap-4">
        {submissions?.map((sub) => (
          <div key={sub.id} className="border border-stone-200 p-4 rounded bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{sub.title}</h2>
                <p className="text-sm text-stone-500">Tipe: {sub.type} | Label: {sub.version_label}</p>
                <p className="text-sm text-stone-500">Status: {sub.status}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => mutation.mutate({ id: sub.id, status: 'approved' })}
                  disabled={mutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Setujui
                </button>
                <button
                  onClick={() => mutation.mutate({ id: sub.id, status: 'rejected' })}
                  disabled={mutation.isPending}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Tolak
                </button>
              </div>
            </div>
            <div className="mt-4 text-sm bg-stone-50 p-3 rounded">
              <p className="font-semibold mb-1">Body:</p>
              <p className="whitespace-pre-wrap">{sub.body}</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="font-semibold mb-1">Sumber:</p>
              <pre className="bg-stone-100 p-2 rounded overflow-auto">
                {JSON.stringify(sub.sources, null, 2)}
              </pre>
            </div>
          </div>
        ))}
        {submissions?.length === 0 && <p className="text-stone-500">Tidak ada antrean.</p>}
      </div>
    </div>
  );
};


