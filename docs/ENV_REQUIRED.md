# ENV Required

| NAMA | Dipakai di | Wajib/Opsional | Fungsi | Cara Mendapatkan | Contoh Format | Batch |
|---|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | web | Wajib | Endpoint akses DB & Auth web | Supabase Dashboard > Project Settings > API | `https://xyz.supabase.co` | B0 |
| `VITE_SUPABASE_ANON_KEY` | web | Wajib | Kunci publik akses web (RLS berlaku) | Supabase Dashboard > Project Settings > API | `eyJhbG...` | B0 |
| `SUPABASE_URL` | worker | Wajib | Endpoint akses DB worker | Supabase Dashboard > Project Settings > API | `https://xyz.supabase.co` | B0 |
| `SUPABASE_SERVICE_ROLE_KEY` | worker | Wajib | Kunci rahasia untuk memotong RLS | Supabase Dashboard > Project Settings > API | `eyJhbG...` | B0 |
