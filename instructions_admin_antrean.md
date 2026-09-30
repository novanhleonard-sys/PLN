You are tasked with refactoring pps/web/src/features/admin/AdminAntrean.tsx.
Following Phase 2 of B13_PLAN.md:
1. Split AdminAntrean.tsx into 3 Tabs: 'Antrean', 'Pantauan AI', and 'Riwayat'.
2. Create pps/web/src/features/admin/antrean/TabAntrean.tsx, TabPantauan.tsx, and TabRiwayat.tsx.
3. In TabAntrean.tsx, display submissions where status = 'needs_review'.
4. When clicking 'Lihat Detail', show a Full-Screen Modal or large drawer with:
   - Full story details.
   - AI Verification summary.
   - Persona Configuration (Dropdowns from style_configs and oice_personas, plus Special Instruction Textareas).
   - "Mulai Proses" Split Button ('Proses Semua', 'Tanpa Gambar & Suara', 'Hanya Gambar', 'Hanya Suara').
   - 'Tolak Cerita' button (with Rejection Reason).
5. When "Mulai Proses" is clicked:
   - Perform an RPC or direct Supabase call to update the submission.
   - It should create a new story and story_version (if not already created), then insert i_process_runs with the config snapshot, then spawn jobs (segment, story-visual-bible, or udio depending on the scope).
6. Ensure you communicate closely with the main agent if you need to create DB Edge Functions or update the backend. DO NOT create fake backend functions. Use direct Supabase inserts in the frontend or ask me to write a backend endpoint/RPC.
