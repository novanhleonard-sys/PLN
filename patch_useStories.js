const fs = require("fs");
let useStories = fs.readFileSync("apps/web/src/features/map/useStories.ts", "utf-8");

useStories = useStories.replace(
  /dongengReady: publishedVersion\.asset_status === 'ready' \|\| publishedVersion\.adaptations\?\.some\(\(a: any\) => a\.status === 'ready'\)/g,
  "dongengReady: publishedVersion.asset_status === 'ready'"
);

fs.writeFileSync("apps/web/src/features/map/useStories.ts", useStories, "utf-8");
