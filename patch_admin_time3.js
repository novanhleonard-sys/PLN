const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminKonten.tsx', 'utf-8');

const targetStr = `{job.status} ({job.attempts}x)
                          </span>
                        </td>
                        <td className="p-4 text-xs text-stone-500 max-w-xs truncate" title={job.error || '-'}>
                          {job.error || '-'}
                        </td>`;

const targetStr2 = targetStr.replace(/\r/g, ''); // Try normalizing

let didReplace = false;

// manual index of replacement
const startIdx = code.indexOf(`{job.status} ({job.attempts}x)`);
if(startIdx !== -1) {
    const endIdx = code.indexOf(`</td>`, code.indexOf(`{job.error || '-'}`)) + 5;
    
    const replacement = `{job.status} ({job.attempts}x)
                          </span>
                          <div className="text-[10px] text-stone-400 mt-1">Dibuat: {new Date(job.created_at).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="p-4 text-xs text-stone-500 max-w-xs truncate" title={job.error || '-'}>
                          <div>{job.error || '-'}</div>
                          {job.status === 'failed' && <div className="text-[10px] text-red-400 mt-1">Jadwal: {new Date(job.run_after).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div>}
                        </td>`;
                        
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('apps/web/src/features/admin/AdminKonten.tsx', code);
    console.log('Replaced by index!');
} else {
    console.log('Not found by index!');
}

