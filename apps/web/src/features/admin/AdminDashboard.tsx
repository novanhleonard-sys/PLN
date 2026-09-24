import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Toast } from '../../ui/basic/Toast';

export function AdminDashboard() {
  const [totalCost, setTotalCost] = useState(0);
  const [costByStage, setCostByStage] = useState<any[]>([]);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    // Fetch costs
    const { data: usage } = await supabase.from('ai_usage').select('stage, cost_usd');
    if (usage) {
      const total = usage.reduce((acc, curr) => acc + (curr.cost_usd || 0), 0);
      setTotalCost(total);
      
      const byStage = usage.reduce((acc: any, curr) => {
        acc[curr.stage] = (acc[curr.stage] || 0) + (curr.cost_usd || 0);
        return acc;
      }, {});
      setCostByStage(Object.entries(byStage).map(([stage, cost]) => ({ stage, cost })));
    }
    
    // Fetch jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .in('status', ['failed', 'deferred'])
      .order('run_after', { ascending: false });
    if (jobs) setFailedJobs(jobs);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetryJob = async (jobId: string) => {
    const { error } = await supabase.from('jobs').update({ status: 'queued', attempts: 0, run_after: new Date().toISOString() }).eq('id', jobId);
    if (error) {
      setToastMessage(error.message);
    } else {
      setToastMessage('Job di-queue ulang');
      fetchData();
    }
  };

  if (loading) return <div className="p-4 font-nunito">Memuat dashboard...</div>;

  return (
    <div className="flex flex-col gap-6 font-nunito">
      <h2 className="text-2xl font-fredoka font-bold text-text-main">Dashboard Operasional</h2>
      
      {/* AI Costs */}
      <div className="bg-white border border-border-light rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text-main mb-4">Biaya AI (Total: ${totalCost.toFixed(4)})</h3>
        <div className="flex flex-col gap-3">
          {costByStage.length === 0 && <p className="text-sm text-text-light">Belum ada penggunaan AI.</p>}
          {costByStage.map(item => (
            <div key={item.stage} className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
              <span className="font-semibold text-text-main capitalize">{item.stage.replace('_', ' ')}</span>
              <span className="text-stone-600 font-mono">${(item.cost as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Failed Jobs */}
      <div className="bg-white border border-border-light rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text-main mb-4">Pekerjaan Gagal & Tertunda</h3>
        {failedJobs.length === 0 ? (
          <p className="text-sm text-text-light">Tidak ada pekerjaan bermasalah.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {failedJobs.map(job => (
              <div key={job.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border border-status-error/30 bg-status-error/5 rounded-xl">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-white border border-border-light rounded-full text-stone-600">{job.kind}</span>
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-red-100 text-red-700 rounded-full">{job.status}</span>
                  </div>
                  <p className="text-sm text-text-main mt-1 font-mono text-xs">{job.error || 'Unknown error'}</p>
                </div>
                <Button variant="secondary" onClick={() => handleRetryJob(job.id)}>Coba Ulang</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}
