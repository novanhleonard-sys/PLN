import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../../ui/basic/Button";
import { Modal } from "../../../ui/layers/Modal";
import { Toast } from "../../../ui/basic/Toast";
import { ChevronDown, ChevronRight, RefreshCw, Edit2 } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  succeeded: "text-teal-700",
  failed: "text-red-600",
  queued: "text-stone-500",
  running: "text-amber-600",
};

function CostBadge({ jobIds }: { jobIds: string[] }) {
  const { data } = useQuery({
    queryKey: ["run_stats", jobIds.join(",")],
    enabled: jobIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_usage")
        .select("cost_usd")
        .in("ref", jobIds);
      const total = (data || []).reduce((acc: number, r: any) => acc + (r.cost_usd || 0), 0);
      return total;
    }
  });
  return <span>Biaya: Rp {((data || 0) * 15000).toLocaleString("id-ID")}</span>;
}

function JobRow({ job, onRevise }: { job: any; onRevise: (job: any) => void }) {
  const { data: usage } = useQuery({
    queryKey: ["job_cost", job.id],
    queryFn: async () => {
      const { data } = await supabase.from("ai_usage").select("cost_usd").eq("ref", job.id);
      return (data || []).reduce((acc: number, r: any) => acc + (r.cost_usd || 0), 0);
    }
  });

  const { data: scene } = useQuery({
    queryKey: ["job_scene", job.ref_id],
    enabled: job.kind === "scene-image",
    queryFn: async () => {
      const { data } = await supabase.from("scenes").select("idx, image_path, description").eq("id", job.ref_id).single();
      return data;
    }
  });

  return (
    <div className="border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
      <div className="p-3 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-700 text-sm">{job.kind}</span>
            {job.kind === "scene-image" && scene && (
              <span className="text-xs text-stone-500">— Scene {scene.idx}</span>
            )}
            <span className={`text-xs font-bold uppercase ${STATUS_COLOR[job.status] || "text-stone-500"}`}>
              {job.status}
            </span>
            <span className="text-xs text-stone-400">×{job.attempts}</span>
            <span className="text-xs text-stone-400">Rp {((usage || 0) * 15000).toLocaleString("id-ID")}</span>
          </div>
          {job.error && (
            <div className="mt-2 text-xs font-mono bg-white border border-red-100 text-red-600 p-2 rounded-lg max-h-28 overflow-y-auto whitespace-pre-wrap">
              {job.error}
            </div>
          )}
        </div>
        {job.kind === "scene-image" && (
          <button
            onClick={() => onRevise(job)}
            className="shrink-0 flex items-center gap-1 text-xs text-teal-700 border border-teal-200 rounded-lg px-2 py-1 hover:bg-teal-50 transition-colors"
          >
            <Edit2 size={12} /> Revisi
          </button>
        )}
      </div>
      {job.kind === "scene-image" && scene?.image_path && (
        <img
          src={scene.image_path}
          alt={`Scene ${scene.idx}`}
          className="w-full max-h-48 object-cover"
        />
      )}
    </div>
  );
}

export function TabRiwayat() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviseJob, setReviseJob] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [toast, setToast] = useState("");

  const { data: runs, isLoading } = useQuery({
    queryKey: ["admin_ai_process_runs", "history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_process_runs")
        .select("*, story_versions(stories(title))")
        .in("status", ["completed", "failed"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: expandedJobs } = useQuery({
    queryKey: ["run_jobs", expanded],
    enabled: !!expanded,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("process_run_id", expanded!)
        .order("created_at");
      if (error) throw error;
      return data;
    }
  });

  const requeueMutation = useMutation({
    mutationFn: async ({ jobId, prompt }: { jobId: string; prompt: string }) => {
      const { error } = await supabase.from("jobs").update({
        status: "queued",
        attempts: 0,
        error: null,
        custom_prompt: prompt || null,
        run_after: new Date().toISOString()
      }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      setToast("Job berhasil diantrekan ulang.");
      setReviseJob(null);
      queryClient.invalidateQueries({ queryKey: ["run_jobs", expanded] });
    }
  });

  const openRevise = (job: any) => {
    setReviseJob(job);
    setCustomPrompt(job.custom_prompt || "");
  };

  if (isLoading) return <div className="p-8 font-nunito animate-pulse text-stone-500">Memuat riwayat...</div>;

  return (
    <div className="flex flex-col gap-4 font-nunito pb-12">
      {!runs?.length ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Belum ada riwayat proses AI.
        </div>
      ) : runs.map((run) => {
        const isOpen = expanded === run.id;
        const title = (run.story_versions?.stories?.title) || "Tanpa Judul";
        const totalAttempts = (expandedJobs && isOpen) ? expandedJobs.reduce((acc: number, j: any) => acc + (j.attempts || 0), 0) : null;

        return (
          <div key={run.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : run.id)}
              className="w-full p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold font-fredoka text-base text-stone-800">{title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mt-1">
                  <span className={`font-bold uppercase ${STATUS_COLOR[run.status] || ""}`}>{run.status}</span>
                  <CostBadge jobIds={expandedJobs && isOpen ? expandedJobs.map((j: any) => j.id) : []} />
                  {totalAttempts !== null && <span>Total Percobaan: {totalAttempts}</span>}
                  <span className="text-stone-400">{new Date(run.created_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
              {isOpen ? <ChevronDown size={18} className="text-stone-400 shrink-0" /> : <ChevronRight size={18} className="text-stone-400 shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-stone-100 p-4 flex flex-col gap-3">
                {!expandedJobs ? (
                  <div className="text-sm text-stone-500 animate-pulse">Memuat jobs...</div>
                ) : expandedJobs.length === 0 ? (
                  <div className="text-sm text-stone-500">Tidak ada job.</div>
                ) : (
                  expandedJobs.map((job: any) => (
                    <JobRow key={job.id} job={job} onRevise={openRevise} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {reviseJob && (
        <Modal isOpen={true} onClose={() => setReviseJob(null)}>
          <h2 className="font-fredoka text-lg font-bold mb-3">Revisi Gambar Scene</h2>
          <p className="text-xs text-stone-500 mb-2">
            Isi prompt khusus untuk generate ulang gambar ini. Kosongkan untuk pakai prompt otomatis.
          </p>
          <textarea
            className="w-full border border-stone-200 rounded-xl p-3 text-sm font-mono min-h-32 resize-none focus:outline-none focus:border-teal-400"
            placeholder="Contoh: Gambar suasana malam, karakter mengenakan batik merah..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
          />
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="secondary" onClick={() => setReviseJob(null)}>Batal</Button>
            <Button
              onClick={() => requeueMutation.mutate({ jobId: reviseJob.id, prompt: customPrompt })}
              disabled={requeueMutation.isPending}
            >
              <RefreshCw size={14} className="mr-1.5" />
              {requeueMutation.isPending ? "Mengantrekan..." : "Regenerate"}
            </Button>
          </div>
        </Modal>
      )}

      <Toast visible={!!toast} message={toast} onClose={() => setToast("")} />
    </div>
  );
}
