import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';

export function AdminLaporan() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*, profiles(display_name)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const resolveReport = async (id: string) => {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    fetchReports();
  };

  return (
    <div className="w-full flex flex-col font-nunito gap-6">
      <div>
        <h2 className="text-2xl font-fredoka font-bold text-stone-800">Laporan Pengguna</h2>
        <p className="text-stone-500 text-sm mt-1">Daftar laporan pelanggaran atau masalah konten dari pengguna.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Memuat laporan...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Pelapor</th>
                <th className="px-6 py-4 font-bold">Target</th>
                <th className="px-6 py-4 font-bold">Alasan</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-stone-400">Tidak ada laporan.</td></tr>
              )}
              {reports.map(r => (
                <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                  <td className="px-6 py-4">{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-semibold text-stone-700">{r.profiles?.display_name || 'Anonim'}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded inline-block truncate max-w-[120px]">
                      {r.target_type}: {r.target_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={r.reason}>{r.reason}</td>
                  <td className="px-6 py-4">
                    {r.status === 'pending' ? (
                      <span className="text-orange-500 font-bold text-xs uppercase tracking-wider bg-orange-50 px-2 py-1 rounded-full">Pending</span>
                    ) : (
                      <span className="text-teal font-bold text-xs uppercase tracking-wider bg-teal/10 px-2 py-1 rounded-full">Resolved</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => resolveReport(r.id)} className="text-teal hover:bg-teal/5">Resolve</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
