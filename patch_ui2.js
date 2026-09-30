const fs = require("fs");
let c = fs.readFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", "utf-8");
c = c.replace('import { useState } from "react";\n\nfunction JobRow', 'function JobRow');
fs.writeFileSync("apps/web/src/features/admin/antrean/TabRiwayat.tsx", c, "utf-8");
