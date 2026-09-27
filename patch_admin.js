const fs = require('fs');
let code = fs.readFileSync('apps/web/src/features/admin/AdminGayaAI.tsx', 'utf-8');

code = code.replace(
  /const \[testModal, setTestModal\] = useState<\{ open: boolean, kind: 'image' \| 'audio', refId: string, name: string \} \| null>\(null\);/,
  "const [testModal, setTestModal] = useState<{ open: boolean, kind: 'image' | 'audio', refId?: string, name: string, snapshot?: any } | null>(null);"
);

code = code.replace(
  /const delStyle = useMutation\(\{ mutationFn: async \(id: string\) => await supabase.from\('style_configs'\).delete\(\).eq\('id', id\).throwOnError\(\), onSuccess: \(\) => queryClient.invalidateQueries\(\{ queryKey: \['admin_styles'\] \}\) \}\);/,
  "const delStyle = useMutation({ mutationFn: async (id: string) => await supabase.from('style_configs').delete().eq('id', id).throwOnError(), onSuccess: () => { setToast('Gaya dihapus.'); queryClient.invalidateQueries({ queryKey: ['admin_styles'] }) }, onError: () => setToast('Gagal menghapus: Gaya sedang digunakan (terikat ke cerita).') });"
);

code = code.replace(
  /const delVoice = useMutation\(\{ mutationFn: async \(id: string\) => await supabase.from\('voice_personas'\).delete\(\).eq\('id', id\).throwOnError\(\), onSuccess: \(\) => queryClient.invalidateQueries\(\{ queryKey: \['admin_voices'\] \}\) \}\);/,
  "const delVoice = useMutation({ mutationFn: async (id: string) => await supabase.from('voice_personas').delete().eq('id', id).throwOnError(), onSuccess: () => { setToast('Persona dihapus.'); queryClient.invalidateQueries({ queryKey: ['admin_voices'] }) }, onError: () => setToast('Gagal menghapus: Persona sedang digunakan (terikat ke cerita).') });"
);

code = code.replace(
  /kind: testModal.kind, text_prompt: testText, style_id: testModal.kind === 'image' \? testModal.refId : null, voice_id: testModal.kind === 'audio' \? testModal.refId : null/,
  "kind: testModal.kind, text_prompt: testText, style_id: (testModal.kind === 'image' && testModal.refId) ? testModal.refId : null, voice_id: (testModal.kind === 'audio' && testModal.refId) ? testModal.refId : null, config_snapshot: testModal.snapshot || null"
);

const btnStyle = "{styleForm.id && <Button variant=\"secondary\" onClick={resetStyle}>Batal</Button>}\n                <Button variant=\"secondary\" className=\"border-teal text-teal hover:bg-teal-50\" disabled={!styleForm.name || !styleForm.descriptor} onClick={() => setTestModal({ open: true, kind: 'image', name: styleForm.name, snapshot: styleForm, refId: styleForm.id })}>\n                  <Icon name=\"Play\" size={14} className=\"mr-1 inline-block\" /> Tes\n                </Button>\n                <Button disabled={!styleForm.name || !styleForm.descriptor || saveStyle.isPending} onClick={() => saveStyle.mutate(styleForm)}>{styleForm.id ? 'Simpan' : 'Buat'}</Button>";

code = code.replace(
  /\{styleForm.id && <Button variant="secondary" onClick=\{resetStyle\}>Batal<\/Button>\}\s*<Button disabled=\{\!styleForm.name \|\| \!styleForm.descriptor \|\| saveStyle.isPending\} onClick=\{\(\) => saveStyle.mutate\(styleForm\)\}>\{styleForm.id \? 'Simpan' : 'Buat'\}<\/Button>/,
  btnStyle
);

const btnVoice = "{voiceForm.id && <Button variant=\"secondary\" onClick={resetVoice}>Batal</Button>}\n                <Button variant=\"secondary\" className=\"border-teal text-teal hover:bg-teal-50\" disabled={!voiceForm.name || !voiceForm.voice_name} onClick={() => setTestModal({ open: true, kind: 'audio', name: voiceForm.name, snapshot: voiceForm, refId: voiceForm.id })}>\n                  <Icon name=\"Play\" size={14} className=\"mr-1 inline-block\" /> Tes\n                </Button>\n                <Button disabled={!voiceForm.name || !voiceForm.voice_name || saveVoice.isPending} onClick={() => saveVoice.mutate(voiceForm)}>{voiceForm.id ? 'Simpan' : 'Buat'}</Button>";

code = code.replace(
  /\{voiceForm.id && <Button variant="secondary" onClick=\{resetVoice\}>Batal<\/Button>\}\s*<Button disabled=\{\!voiceForm.name \|\| \!voiceForm.voice_name \|\| saveVoice.isPending\} onClick=\{\(\) => saveVoice.mutate\(voiceForm\)\}>\{voiceForm.id \? 'Simpan' : 'Buat'\}<\/Button>/,
  btnVoice
);

fs.writeFileSync('apps/web/src/features/admin/AdminGayaAI.tsx', code);
