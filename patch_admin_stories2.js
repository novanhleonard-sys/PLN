const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminKonten.tsx', 'utf-8');

code = code.replace(
    /\.from\('stories'\)\s*\.select\([\s\S]*?\)\s*\.order\('created_at'/g,
    `.from('admin_stories_view')
          .select('*')
          .order('created_at'`
);

// We need to cast `story` as `any` in the map callback to avoid TS errors
code = code.replace(
    /stories\?\.map\(\(story\) => \{/g,
    `stories?.map((story: any) => {`
);

fs.writeFileSync('apps/web/src/features/admin/AdminKonten.tsx', code);
