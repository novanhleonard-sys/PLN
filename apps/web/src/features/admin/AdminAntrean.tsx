import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const AdminAntrean = () => {
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      // Query submissions and their latest verification runs
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          verification_runs(*)
        `)
        .eq('status', 'needs_review')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const verdictMutation = useMutation({
    mutationFn: async ({ id, verdict, reason }: { id: string; verdict: 'approved' | 'rejected', reason?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin_verdict', {
        body: { submission_id: id, verdict, reason }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-submissions'] })
  });

  if (isLoading) return <div className="p-8 font-nunito">Memuat antrean...</div>;

  return (
    <div className="p-8 font-nunito max-w-6xl mx-auto">
      <h1 className="text-2xl font-fredoka font-semibold mb-6">Antrean Kontribusi</h1>
      
      {submissions?.length === 0 ? (
        <p className="text-stone-500">Tidak ada kontribusi yang menunggu tinjauan admin.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {submissions?.map(sub => {
            const verifications = Array.isArray(sub.verification_runs) ? sub.verification_runs : [];
            const latestVer = verifications.length > 0 ? verifications[verifications.length - 1] : null;

            return (
              <Card key={sub.id} className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold font-fredoka text-text-main">{sub.title}</h2>
                    <p className="text-sm text-stone-500">{sub.type} | {sub.version_label}</p>
                  </div>
                  <Badge variant={sub.status === "pending" ? "warning" : "default"} className="uppercase">{sub.status}</Badge>
                </div>

                <div className="bg-stone-50 p-4 rounded-lg text-sm border border-border-light h-32 overflow-y-auto whitespace-pre-wrap">
                  {sub.body}
                </div>

                {latestVer && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm">
                    <h3 className="font-bold text-blue-900 mb-2">Hasil Verifikasi AI:</h3>
                    <p><strong>Verdict:</strong> {latestVer.verdict} ({latestVer.confidence * 100}%)</p>
                    {latestVer.safety_flags?.length > 0 && (
                      <p className="text-red-600 font-bold">Safety Flags: {latestVer.safety_flags.join(', ')}</p>
                    )}
                    {latestVer.discrepancies?.length > 0 && (
                      <div>
                        <strong className="text-amber-700">Discrepancies:</strong>
                        <ul className="list-disc pl-5">
                          {latestVer.discrepancies.map((d: any, i: number) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 mt-2">
                  <Button onClick={() => {
                      if (confirm('Setujui kontribusi ini?')) {
                        verdictMutation.mutate({ id: sub.id, verdict: 'approved' });
                      }
                    }}
                  >
                    Setujui</Button>
                  <Button variant="ghost" className="text-feedback-error bg-feedback-error/10 hover:bg-feedback-error/20" onClick={() => {
                      const reason = prompt('Alasan tolak (wajib):');
                      if (reason && reason.length >= 5) {
                        verdictMutation.mutate({ id: sub.id, verdict: 'rejected', reason });
                      } else if (reason !== null) {
                        alert('Alasan tolak wajib diisi minimal 5 karakter.');
                      }
                    }}
                  >
                    Tolak</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};





