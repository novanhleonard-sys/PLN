const fs = require('fs');
const path = require('path');

const filePath = path.join('D:\\project\\PETA LN\\apps\\web\\src\\features\\admin\\antrean\\TabRiwayat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useMemo
content = content.replace("import { useState } from 'react';", "import { useState, useMemo } from 'react';");

// 2. Add expandedStory state
content = content.replace(
  "const [expanded, setExpanded] = useState<string | null>(null);",
  "const [expandedStory, setExpandedStory] = useState<string | null>(null);\n  const [expanded, setExpanded] = useState<string | null>(null);"
);

// 3. Add groupedRuns logic inside TabRiwayat
content = content.replace(
  /const requeueMutation = useMutation\(\{/,
  "const groupedRuns = useMemo(() => {\n" +
  "  if (!runs) return [];\n" +
  "  const groups: Record<string, any[]> = {};\n" +
  "  runs.forEach((run: any) => {\n" +
  "    const title = (run.story_versions?.stories?.title) || 'Tanpa Judul';\n" +
  "    if (!groups[title]) groups[title] = [];\n" +
  "    groups[title].push(run);\n" +
  "  });\n" +
  "  return Object.entries(groups).map(([title, storyRuns]) => ({ title, runs: storyRuns }));\n" +
  "}, [runs]);\n\n" +
  "  const requeueMutation = useMutation({"
);

fs.writeFileSync(filePath, content);
console.log('Modified TabRiwayat.tsx part 1');
