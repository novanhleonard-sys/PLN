const fs = require("fs");

let pantauan = fs.readFileSync("apps/web/src/features/admin/antrean/TabPantauan.tsx", "utf-8");
pantauan = pantauan.replace(
  /Biaya: Rp \{\(run\.jobs\?\.reduce\(\(acc: any, j: any\) => acc \+ \(j\.cost_usd \|\| 0\), 0\) \* 15000\)\.toLocaleString\('id-ID'\)\}/g,
  "Biaya: ${Number(run.jobs?.reduce((acc: any, j: any) => acc + (j.cost_usd || 0), 0) || 0).toFixed(4)}"
);
fs.writeFileSync("apps/web/src/features/admin/antrean/TabPantauan.tsx", pantauan, "utf-8");

let riwayat = fs.readFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", "utf-8");
riwayat = riwayat.replace(
  /Biaya: Rp \{\(\(data \|\| 0\) \* 15000\)\.toLocaleString\("id-ID"\)\}/g,
  "Biaya: \\$${Number(data || 0).toFixed(4)}"
);

riwayat = riwayat.replace(
  /Rp \{\(\(\(usageLogs \|\| \[\]\)\.reduce\(\(a, r\) => a \+ \(r\.cost_usd \|\| 0\), 0\)\) \* 15000\)\.toLocaleString\("id-ID"\)\}/g,
  "\\$${((usageLogs || []).reduce((a: any, r: any) => a + (r.cost_usd || 0), 0)).toFixed(4)}"
);
fs.writeFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", riwayat, "utf-8");
