import React, { lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { useAuth } from './features/auth/AuthStore.ts'
import { RequireAdmin } from './features/auth/RequireAdmin.tsx'

import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css'

const Styleguide = lazy(() => import('./routes/styleguide.tsx'))
const Home = lazy(() => import('./routes/Home.tsx'))
const Baca = lazy(() => import('./features/reader/baca/Baca').then(m => ({ default: m.Baca })))
const Login = lazy(() => import('./routes/Login.tsx').then(m => ({ default: m.Login })))
const AdminAntrean = lazy(() => import('./features/admin/AdminAntrean').then(m => ({ default: m.AdminAntrean })))
const AdminKonten = lazy(() => import('./features/admin/AdminKonten').then(m => ({ default: m.AdminKonten })))
const AdminPengaturan = lazy(() => import('./features/admin/AdminPengaturan').then(m => ({ default: m.AdminPengaturan })))
const Profile = lazy(() => import('./features/profile/Profile.tsx').then(m => ({ default: m.Profile })))

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuth();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Suspense fallback={<div className="p-8 text-stone-500 font-nunito">Memuat aplikasi...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cerita/:slug" element={<Home />} />
        <Route path="/baca/:versionId" element={<Baca />} />
        <Route path="/masuk" element={<Login />} />
        <Route path="/profil/*" element={<Profile />} />
        <Route path="/styleguide" element={<Styleguide />} />
        
        <Route path="/admin/antrean" element={<RequireAdmin><AdminAntrean /></RequireAdmin>} />
        <Route path="/admin/konten" element={<RequireAdmin><AdminKonten /></RequireAdmin>} />
        <Route path="/admin/pengaturan" element={<RequireAdmin><AdminPengaturan /></RequireAdmin>} />
      </Routes>
    </Suspense>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

