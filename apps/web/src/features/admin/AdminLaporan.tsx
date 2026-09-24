import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Chip } from '../../ui/basic/Chip';
import { Toast } from '../../ui/basic/Toast';

export function AdminLaporan() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, profiles(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: 'ignore' | 'unpublish_version' | 'delete_adaptation', targetType: string, targetId: string) => {
    try {
      if (action === 'ignore') {
        await supabase.from('reports').update({ status: 'ignored' }).eq('id', reportId);
      } else if (action === 'unpublish_version') {
        if (targetType === 'version') {
          await supabase.from('story_versions').update({ status: 'draft' }).eq('id', targetId);
        }
        await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
      } else if (action === 'delete_adaptation') {
        if (targetType === 'adaptation') {
          await supabase.from('adaptations').delete().eq('id', targetId);
        }
        await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
      }
      setToastMessage('Tindakan berhasil diterapkan');
      fetchReports();
    } catch (e: any) {
      setToastMessage(e.message || 'Terjadi kesalahan');
    }
  };

  if (loading) return <div className="p-4 font-nunito">Memuat laporan...</div>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-fredoka font-bold text-text-main">Laporan Konten</h2>
      {reports.length === 0 ? (
        <div className="p-8 text-center text-stone-500 bg-white rounded-xl border border-border-light">
          Tidak ada laporan tertunda.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white border border-border-light rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Chip type={report.target_type === 'adaptation' ? 'region' : 'legend'} label={report.target_type.toUpperCase()} className="h-6 px-2 text-xs" />
                  <span className="text-xs text-stone-500 font-mono">{report.target_id}</span>
                </div>
                <p className="text-text-main font-semibold">"{report.reason}"</p>
                <p className="text-xs text-text-light">Dilaporkan oleh: {report.profiles?.full_name || 'Pengguna'} pada {new Date(report.created_at).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button variant="secondary" onClick={() => handleAction(report.id, 'ignore', report.target_type, report.target_id)}>
                  Abaikan
                </Button>
                {report.target_type === 'version' && (
                  <Button variant="secondary" className="!text-status-error !border-status-error/30 hover:!bg-status-error/10" onClick={() => handleAction(report.id, 'unpublish_version', report.target_type, report.target_id)}>
                    Unpublish Versi
                  </Button>
                )}
                {report.target_type === 'adaptation' && (
                  <Button variant="secondary" className="!text-status-error !border-status-error/30 hover:!bg-status-error/10" onClick={() => handleAction(report.id, 'delete_adaptation', report.target_type, report.target_id)}>
                    Hapus Adaptasi
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {toastMessage && <Toast visible={!!toastMessage} message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
}
