const fs = require('fs');
const path = require('path');

const filePath = path.join('D:\\project\\PETA LN\\apps\\web\\src\\features\\admin\\antrean\\TabRiwayat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add useMemo
content = content.replace(import { useState } from 'react';, import { useState, useMemo } from 'react';);

// 2. Add expandedStory state
content = content.replace(
  const [expanded, setExpanded] = useState<string | null>(null);,
  const [expandedStory, setExpandedStory] = useState<string | null>(null);\n  const [expanded, setExpanded] = useState<string | null>(null);
);

// 3. Add groupedRuns logic inside TabRiwayat
content = content.replace(
  /const requeueMutation = useMutation\(\{/,
  const groupedRuns = useMemo(() => {
    if (!runs) return [];
    const groups: Record<string, any[]> = {};
    runs.forEach((run: any) => {
      const title = (run.story_versions?.stories?.title) || 'Tanpa Judul';
      if (!groups[title]) groups[title] = [];
      groups[title].push(run);
    });
    return Object.entries(groups).map(([title, storyRuns]) => ({ title, runs: storyRuns }));
  }, [runs]);

  const requeueMutation = useMutation({
);

// 4. Replace the map logic in JSX
const searchStr =       {!runs?.length ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Belum ada riwayat proses AI.
        </div>
      ) : runs.map((run) => {
        const isOpen = expanded === run.id;
        const title = (run.story_versions?.stories?.title) || 'Tanpa Judul';
        const totalAttempts = (expandedJobs && isOpen) ? expandedJobs.reduce((acc: number, j: any) => acc + (j.attempts || 0), 0) : null;

        return (
          <div key={run.id} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            <button
              onClick={() => setExpanded(isOpen ? null : run.id)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-2">
                  <span className={\ont-bold uppercase \\}>{run.status}</span>
                  <CostBadge jobIds={expandedJobs && isOpen ? expandedJobs.map((j: any) => j.id) : []} />
                  {totalAttempts !== null && <span>Total Percobaan: {totalAttempts}</span>}
                  <span className="text-stone-400">{new Date(run.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="bg-stone-100 p-2 rounded-full shrink-0">
                {isOpen ? <ChevronDown size={20} className="text-stone-500" /> : <ChevronRight size={20} className="text-stone-500" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-stone-100 p-5 bg-stone-50 flex flex-col gap-4">
                {!expandedJobs ? (
                  <div className="text-sm text-stone-500 animate-pulse">Memuat jobs...</div>
                ) : expandedJobs.length === 0 ? (
                  <div className="text-sm text-stone-500">Tidak ada job.</div>
                ) : (
                  expandedJobs.map((job: any) => (
                    <JobRow key={job.id} job={job} onRevise={openRevise} onImageClick={setFullScreenImage} />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })};

const replaceStr =       {!groupedRuns.length ? (
        <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          Belum ada riwayat proses AI.
        </div>
      ) : groupedRuns.map(({ title, runs: storyRuns }) => {
        const isStoryOpen = expandedStory === title;

        return (
          <div key={title} className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            <button
              onClick={() => setExpandedStory(isStoryOpen ? null : title)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold font-fredoka text-lg text-stone-800">{title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 mt-2">
                  <span>{storyRuns.length} Proses Antrean</span>
                </div>
              </div>
              <div className="bg-stone-100 p-2 rounded-full shrink-0">
                {isStoryOpen ? <ChevronDown size={20} className="text-stone-500" /> : <ChevronRight size={20} className="text-stone-500" />}
              </div>
            </button>

            {isStoryOpen && (
              <div className="border-t border-stone-100 bg-stone-50/50">
                {storyRuns.map((run: any) => {
                  const isOpen = expanded === run.id;
                  const totalAttempts = (expandedJobs && isOpen) ? expandedJobs.reduce((acc: number, j: any) => acc + (j.attempts || 0), 0) : null;
                  
                  return (
                    <div key={run.id} className="border-b border-stone-100 last:border-b-0">
                      <button
                        onClick={() => setExpanded(isOpen ? null : run.id)}
                        className="w-full p-4 flex items-center justify-between gap-4 hover:bg-stone-100 transition-colors text-left"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                            <span className={\ont-bold uppercase \\}>{run.status}</span>
                            <span className="font-mono text-xs bg-stone-200 px-2 py-0.5 rounded text-stone-600">{run.scope}</span>
                            <CostBadge jobIds={expandedJobs && isOpen ? expandedJobs.map((j: any) => j.id) : []} />
                            {totalAttempts !== null && <span>Total Percobaan: {totalAttempts}</span>}
                            <span className="text-stone-400">{new Date(run.created_at).toLocaleDateString('id-ID')} {new Date(run.created_at).toLocaleTimeString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="text-stone-400">
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-stone-100 flex flex-col gap-4 border-t border-stone-200 shadow-inner">
                          {!expandedJobs ? (
                            <div className="text-sm text-stone-500 animate-pulse">Memuat jobs...</div>
                          ) : expandedJobs.length === 0 ? (
                            <div className="text-sm text-stone-500">Tidak ada job.</div>
                          ) : (
                            expandedJobs.map((job: any) => (
                              <JobRow key={job.id} job={job} onRevise={openRevise} onImageClick={setFullScreenImage} />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })};

content = content.replace(searchStr, replaceStr);

fs.writeFileSync(filePath, content);
console.log('Modified TabRiwayat.tsx');
