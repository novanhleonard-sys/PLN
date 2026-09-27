const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminKonten.tsx', 'utf-8');

// Update useQuery to query admin_stories_view
code = code.replace(
    /\.from\('stories'\)\n\s*\.select\([\s\S]*?\)\n\s*\.order\('created_at'/m,
    `.from('admin_stories_view')
          .select('*')
          .order('created_at'`
);

// Update table headers
code = code.replace(
    '<th className="p-4 font-bold">Selesai Dibaca</th>',
    '<th className="p-4 font-bold">Selesai Dibaca</th>\n                      <th className="p-4 font-bold">Total Spend AI</th>'
);

// Update table data rendering
code = code.replace(
    /const readCount = Array\.isArray\(story\.story_stats\) \? story\.story_stats\[0\]\?\.reads_count : \(story\.story_stats as any\)\?\.reads_count;\n\s*return \(\n\s*<tr key=\{story\.id\}/,
    `const readCount = story.reads_count || 0;
                      return (
                        <tr key={story.id}`
);

// Add the TD for Spend AI
const tdRegex = /<td className="p-4 text-stone-600 font-mono">\s*\{readCount \|\| 0\} kali\s*<\/td>/;
const tdReplacement = `<td className="p-4 text-stone-600 font-mono">
                            {readCount || 0} kali
                          </td>
                          <td className="p-4 text-stone-600 font-mono text-sm">
                            Rp {(story.total_spend_idr || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </td>`;
code = code.replace(tdRegex, tdReplacement);

fs.writeFileSync('apps/web/src/features/admin/AdminKonten.tsx', code);
console.log('AdminKonten patched for stories view');
