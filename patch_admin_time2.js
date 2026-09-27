const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminKonten.tsx', 'utf-8');

const regex = /{job\.status\} \(\{job\.attempts\}x\)\n\s*<\/span>\n\s*<\/td>\n\s*<td className="p-4 text-xs text-stone-500 max-w-xs truncate" title=\{job\.error \|\| '-'\}>\n\s*\{job\.error \|\| '-'\}\n\s*<\/td>/g;

const replacement = `{job.status} ({job.attempts}x)
                          </span>
                          <div className="text-[10px] text-stone-400 mt-1">Dibuat: {new Date(job.created_at).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="p-4 text-xs text-stone-500 max-w-xs truncate" title={job.error || '-'}>
                          <div>{job.error || '-'}</div>
                          {job.status === 'failed' && <div className="text-[10px] text-red-400 mt-1">Jadwal run: {new Date(job.run_after).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>}
                        </td>`;

code = code.replace(regex, replacement);

fs.writeFileSync('apps/web/src/features/admin/AdminKonten.tsx', code);
