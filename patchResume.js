const fs = require('fs');
let code = fs.readFileSync('D:/project/PETA LN/apps/web/src/features/admin/antrean/TabPantauan.tsx', 'utf8');

const resumeMutationCode = `
  const resumeMutation = useMutation({
    mutationFn: async (runId: string) => {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'queued', attempts: 0, error: null, run_after: new Date().toISOString() })
        .eq('process_run_id', runId)
        .in('status', ['failed', 'deferred']);
      if (error) throw error;
      
      const { error: runError } = await supabase
        .from('ai_process_runs')
        .update({ status: 'running' })
        .eq('id', runId);
      if (runError) throw runError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai_runs'] });
    }
  });
`;

code = code.replace("const stopMutation = useMutation({", resumeMutationCode + "\n  const stopMutation = useMutation({");

const resumeButtonCode = `
                  <Button 
                    variant="secondary"
                    className="!text-amber-600 !border-amber-200 hover:!bg-amber-50"
                    onClick={() => {
                      if (window.confirm('Yakin ingin melanjutkan (resume) antrean yang gagal/deferred?')) {
                        resumeMutation.mutate(run.id);
                      }
                    }}
                    disabled={resumeMutation.isPending}
                  >
                    Resume
                  </Button>
                  <Button 
`;

code = code.replace("                  <Button \n                    variant=\"secondary\" \n                    className=\"!text-red-600", resumeButtonCode + "                    variant=\"secondary\" \n                    className=\"!text-red-600");

fs.writeFileSync('D:/project/PETA LN/apps/web/src/features/admin/antrean/TabPantauan.tsx', code, 'utf8');
