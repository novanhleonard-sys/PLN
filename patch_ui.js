const fs = require("fs");
let c = fs.readFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", "utf-8");

c = c.replace(
  'function JobRow({ job, onRevise }: { job: any; onRevise: (job: any) => void }) {',
  'import { useState } from "react";\n\nfunction JobRow({ job, onRevise }: { job: any; onRevise: (job: any) => void }) {\n  const [showUsage, setShowUsage] = useState(false);'
);

c = c.replace(
  'const { data } = await supabase.from("ai_usage").select("cost_usd").eq("ref", job.id);',
  'const { data } = await supabase.from("ai_usage").select("*").eq("ref", job.id).order("created_at", { ascending: true });'
);

c = c.replace(
  'return (data || []).reduce((acc: number, r: any) => acc + (r.cost_usd || 0), 0);',
  'return data || [];'
);

// We need to change `usage` which is now an array to a total cost sum.
c = c.replace(
  'const { data: usage } = useQuery({',
  'const { data: usageLogs } = useQuery({'
);

c = c.replace(
  'Rp {((usage || 0) * 15000).toLocaleString("id-ID")}',
  'Rp {(((usageLogs || []).reduce((a, r) => a + (r.cost_usd || 0), 0)) * 15000).toLocaleString("id-ID")}'
);

const expandButton = `
          {usageLogs && usageLogs.length > 0 && (
            <button onClick={() => setShowUsage(!showUsage)} className="mt-2 text-xs font-bold text-teal-600 hover:underline">
              {showUsage ? "Tutup Detail Usage" : \`Lihat \${usageLogs.length} Usage Logs\`}
            </button>
          )}
          {showUsage && usageLogs && usageLogs.length > 0 && (
            <div className="mt-2 text-[10px] sm:text-xs font-mono bg-stone-100 p-2 rounded flex flex-col gap-1">
              <div className="grid grid-cols-12 font-bold text-stone-500 border-b border-stone-200 pb-1 mb-1">
                <div className="col-span-1">Att</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3">Model</div>
                <div className="col-span-2 text-right">In</div>
                <div className="col-span-2 text-right">Out</div>
                <div className="col-span-2 text-right">Cost ($)</div>
              </div>
              {usageLogs.map((log: any, i: number) => (
                <div key={log.id} className="grid grid-cols-12 items-start border-b border-stone-200/50 pb-1 last:border-0 last:pb-0">
                  <div className="col-span-1">{log.attempt || i + 1}</div>
                  <div className={\`col-span-2 \${log.operation_status === 'failed' ? 'text-red-500' : 'text-teal-600'}\`}>{log.operation_status || 'succeeded'}</div>
                  <div className="col-span-3 truncate" title={log.model}>{log.model}</div>
                  <div className="col-span-2 text-right">{log.units_in}</div>
                  <div className="col-span-2 text-right">{log.units_out}</div>
                  <div className="col-span-2 text-right font-semibold">\${(log.cost_usd || 0).toFixed(4)}</div>
                  {log.error_message && (
                    <div className="col-span-12 text-red-500 mt-0.5 truncate" title={log.error_message}>Err: {log.error_message}</div>
                  )}
                </div>
              ))}
            </div>
          )}
`;

c = c.replace(
  '{job.error && (',
  expandButton + '\n          {job.error && ('
);

fs.writeFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", c, "utf-8");
