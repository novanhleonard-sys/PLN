const fs = require("fs");
let riwayat = fs.readFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", "utf-8");
riwayat = riwayat.replace(/Biaya: \\\$/g, "Biaya: $");
riwayat = riwayat.replace(/className="text-xs text-stone-400">\\\$/g, 'className="text-xs text-stone-400">$');
fs.writeFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", riwayat, "utf-8");
