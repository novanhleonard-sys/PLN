import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';
import { Icon } from '../../ui/basic/Icon';

export function AdminDashboard() {
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);

  // Data states
  const [visitorStats, setVisitorStats] = useState({ sessions: 0, activeUsers: 0 });
  const [readStats, setReadStats] = useState({ sessions: 0, completed: 0, completionRate: 0, avgReadSec: 0, avgListenSec: 0 });
  const [topStories, setTopStories] = useState<any[]>([]);
  const [aiCost, setAiCost] = useState({ total: 0, byStage: {} as Record<string, number> });
  const [contributions, setContributions] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [jobs, setJobs] = useState({ running: 0, failed: 0, deferred: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
        setTempStart(null);
      }
    };
    if (isPickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  const getDaysInMonth = () => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    return Array.from({length: days}, (_, i) => new Date(y, m, i + 1));
  };

  const fetchData = async () => {
    setLoading(true);

    const startIso = dateRange.start.toISOString();
    const endDateObj = new Date(dateRange.end);
    endDateObj.setHours(23, 59, 59, 999);
    const endIso = endDateObj.toISOString();

    try {
      // 1. Visitors
      const { data: appSess } = await supabase.from('app_sessions').select('user_id').gte('started_at', startIso).lte('started_at', endIso);
      if (appSess) {
        const activeUserIds = new Set(appSess.filter(s => s.user_id).map(s => s.user_id));
        setVisitorStats({ sessions: appSess.length, activeUsers: activeUserIds.size });
      }

      // 2. Reading
      const { data: readSess } = await supabase.from('read_sessions').select('*').gte('started_at', startIso).lte('started_at', endIso);
      if (readSess) {
        const completed = readSess.filter(s => s.is_completed).length;
        const total = readSess.length;
        const rate = total > 0 ? (completed / total) * 100 : 0;
        
        const readModes = readSess.filter(s => s.mode === 'baca');
        const listenModes = readSess.filter(s => s.mode === 'dongeng');

        const calcDuration = (arr: any[]) => {
          if (arr.length === 0) return 0;
          const totalSec = arr.reduce((acc, curr) => {
             const start = new Date(curr.started_at).getTime();
             const end = new Date(curr.last_ping_at).getTime();
             return acc + Math.max(0, (end - start) / 1000);
          }, 0);
          return totalSec / arr.length;
        };

        setReadStats({
          sessions: total,
          completed,
          completionRate: rate,
          avgReadSec: calcDuration(readModes),
          avgListenSec: calcDuration(listenModes)
        });
      }

      // 3. AI Cost
      const { data: usage } = await supabase.from('ai_usage').select('stage, cost_usd').gte('created_at', startIso).lte('created_at', endIso);
      if (usage) {
        let total = 0;
        const byStage: Record<string, number> = {};
        usage.forEach(u => {
           total += u.cost_usd || 0;
           byStage[u.stage] = (byStage[u.stage] || 0) + (u.cost_usd || 0);
        });
        setAiCost({ total, byStage });
      }

      // 4. Top Stories
      const { data: top } = await supabase.from('story_stats').select('reads_count, saves_count, story:stories(id, title)').order('reads_count', { ascending: false }).limit(5);
      if (top) setTopStories(top);

      // 5. Contributions (Global)
      const { data: subs } = await supabase.from('submissions').select('status');
      if (subs) {
        setContributions({
          total: subs.length,
          pending: subs.filter(s => s.status === 'pending').length,
          approved: subs.filter(s => s.status === 'approved').length,
          rejected: subs.filter(s => s.status === 'rejected').length
        });
      }

      // 6. Jobs (Global)
      const { data: dbJobs } = await supabase.from('jobs').select('status');
      if (dbJobs) {
        setJobs({
          running: dbJobs.filter(j => j.status === 'running').length,
          failed: dbJobs.filter(j => j.status === 'failed').length,
          deferred: dbJobs.filter(j => j.status === 'deferred').length
        });
      }

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatSec = (sec: number) => {
    if (sec === 0) return 'Belum ada data';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col gap-8 font-nunito w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-fredoka font-bold text-stone-800">Dashboard Operasional</h2>
          <p className="text-stone-500 text-sm mt-1">Ringkasan aktivitas platform dan penggunaan metrik operasional.</p>
        </div>
        
        <div className="relative z-50" ref={pickerRef}>
          <button 
            onClick={() => {
              if (!isPickerOpen) setTempStart(null);
              setIsPickerOpen(!isPickerOpen);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-sm text-sm font-bold text-stone-700 hover:border-teal transition-colors"
          >
            <Icon name="Calendar" size={16} className="text-teal" />
            {dateRange.start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {dateRange.end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </button>
          
          {isPickerOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg p-4 w-72">
              <div className="text-sm font-bold text-stone-800 mb-2 text-center">
                {today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-xs text-stone-500 mb-4 text-center">
                {!tempStart ? 'Pilih Tanggal Mulai' : 'Pilih Tanggal Selesai'}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 mb-2">
                <div>M</div><div>S</div><div>S</div><div>R</div><div>K</div><div>J</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length: new Date(today.getFullYear(), today.getMonth(), 1).getDay()}).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {getDaysInMonth().map((d, i) => {
                  const t = d.getTime();
                  const s = dateRange.start.getTime();
                  const e = dateRange.end.getTime();
                  
                  const isSelected = (!tempStart && t >= s && t <= e) || (tempStart && t === tempStart.getTime());
                  
                  return (
                    <button 
                      key={i}
                      onClick={() => {
                        if (!tempStart) {
                          setTempStart(d);
                        } else {
                          const newStart = d < tempStart ? d : tempStart;
                          const newEnd = d < tempStart ? tempStart : d;
                          setDateRange({ start: newStart, end: newEnd });
                          setIsPickerOpen(false);
                          setTempStart(null);
                        }
                      }}
                      className={cn(
                        "h-8 rounded-full flex items-center justify-center text-sm transition-colors",
                        isSelected ? "bg-teal text-white font-bold" : "hover:bg-stone-100 text-stone-700"
                      )}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-500 animate-pulse">Memuat data dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card: Pengunjung */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-stone-800 font-bold font-fredoka mb-1">Pengunjung</h3>
            <p className="text-xs text-stone-400 mb-4 h-8 leading-tight">Jumlah unik sesi kunjungan dan pengguna yang masuk (login).</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-teal">{visitorStats.sessions || 'Belum ada data'}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sesi Kunjungan</div>
              </div>
              <div>
                <div className="text-2xl font-black text-coral">{visitorStats.activeUsers || 'Belum ada data'}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Pengguna Login</div>
              </div>
            </div>
          </div>

          {/* Card: Pembacaan */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-stone-800 font-bold font-fredoka mb-1">Pembacaan</h3>
            <p className="text-xs text-stone-400 mb-4 h-8 leading-tight">Aktivitas konsumsi cerita dan rasio penuntasan baca.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-teal">{readStats.sessions || 'Belum ada data'}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Sesi Cerita</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal">{readStats.completionRate > 0 ? `${readStats.completionRate.toFixed(1)}%` : 'Belum ada data'}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tingkat Selesai</div>
              </div>
            </div>
          </div>

          {/* Card: Waktu Rata-Rata */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-stone-800 font-bold font-fredoka mb-1">Waktu Aktif</h3>
            <p className="text-xs text-stone-400 mb-4 h-8 leading-tight">Durasi rata-rata pengguna berinteraksi langsung tanpa idle.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-black text-teal">{formatSec(readStats.avgReadSec)}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mode Baca</div>
              </div>
              <div>
                <div className="text-lg font-black text-teal">{formatSec(readStats.avgListenSec)}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Mode Dongeng</div>
              </div>
            </div>
          </div>

          {/* Card: Biaya AI */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
            <h3 className="text-stone-800 font-bold font-fredoka mb-1">Biaya Operasional AI</h3>
            <p className="text-xs text-stone-400 mb-4 h-4 leading-tight">Total pengeluaran API per tahap eksekusi.</p>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0 flex flex-col justify-center">
                <div className="text-4xl font-black text-coral">{aiCost.total > 0 ? `$${aiCost.total.toFixed(4)}` : 'Belum ada data'}</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">Total Periode Ini</div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(aiCost.byStage).map(([stage, cost]) => (
                  <div key={stage} className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="text-sm font-black text-stone-700">$${cost.toFixed(4)}</div>
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">{stage}</div>
                  </div>
                ))}
                {Object.keys(aiCost.byStage).length === 0 && <div className="text-sm text-stone-400 py-3">Belum ada pengeluaran</div>}
              </div>
            </div>
          </div>

          {/* Card: Kontribusi & Job */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-stone-800 font-bold font-fredoka mb-1">Kontribusi User</h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Total Masuk</span><span className="font-bold">{contributions.total}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Diterima / Ditolak</span><span className="font-bold text-teal">{contributions.approved} <span className="text-stone-300">/</span> <span className="text-red-500">{contributions.rejected}</span></span>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <h3 className="text-stone-800 font-bold font-fredoka mb-1 flex items-center gap-2">Job AI <Link to="/admin/antrean" className="text-[10px] text-teal underline uppercase tracking-wider">Lihat Daftar</Link></h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Berjalan</span><span className="font-bold">{jobs.running}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Gagal / Tertunda</span><span className="font-bold text-red-500">{jobs.failed} <span className="text-stone-300">/</span> <span className="text-orange-500">{jobs.deferred}</span></span>
              </div>
            </div>
          </div>

          {/* Card: Cerita Terpopuler */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm lg:col-span-3">
            <h3 className="text-stone-800 font-bold font-fredoka mb-1">Cerita Terpopuler (Global)</h3>
            <p className="text-xs text-stone-400 mb-4 h-4 leading-tight">Berdasarkan total pembacaan historis tertinggi.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-stone-500 uppercase bg-stone-50 border-y border-stone-200">
                  <tr>
                    <th className="px-4 py-3 font-bold">Judul Cerita</th>
                    <th className="px-4 py-3 font-bold">Pembacaan</th>
                    <th className="px-4 py-3 font-bold">Disimpan</th>
                  </tr>
                </thead>
                <tbody>
                  {topStories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-stone-400">Belum ada data statistik.</td>
                    </tr>
                  )}
                  {topStories.map((ts, idx) => (
                    <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/cerita/${ts.story?.id}`} className="font-bold text-teal hover:underline">{ts.story?.title}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono">{ts.reads_count}</td>
                      <td className="px-4 py-3 font-mono">{ts.saves_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
