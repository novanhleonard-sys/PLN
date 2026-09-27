const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminKonten.tsx', 'utf-8');

const targetRegex = /\{job\.status\} \(\{job\.attempts\}x\)\s*<\/span>\s*<\/td>\s*<td className="p-4 text-xs text-stone-500 max-w-xs truncate" title=\{job\.error \|\| '-'}>\s*\{job\.error \|\| '-'}\s*<\/td>/;

const replacement = `{job.status} ({job.attempts}x)
                          </span>
                          <div className="text-[10px] text-stone-400 mt-1">
                            {new Date(job.created_at).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="p-4 text-xs text-stone-500 max-w-xs truncate" title={job.error || '-'}>
                          <div>{job.error || '-'}</div>
                          {job.status === 'failed' && <div className="text-[10px] text-red-400 mt-1">{new Date(job.run_after).toLocaleString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>}
                        </td>`;

if (targetRegex.test(code)) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync('apps/web/src/features/admin/AdminKonten.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Regex did not match!");
}
