import React, { lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { useAuth } from './features/auth/AuthStore.ts'

import { RequireAuth } from './features/auth/RequireAuth.tsx';
import { SessionTracker } from './features/analytics/SessionTracker';

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
const AdminCenter = lazy(() => import('./features/admin/AdminCenter').then(m => ({ default: m.AdminCenter })))




const Profile = lazy(() => import('./features/profile/Profile.tsx').then(m => ({ default: m.Profile })))
const Pengaturan = lazy(() => import('./features/profile/Pengaturan.tsx').then(m => ({ default: m.Pengaturan })))
const ContributeForm = lazy(() => import('./features/contribute/ContributeForm').then(m => ({ default: m.ContributeForm })))
const MyContributions = lazy(() => import('./features/contribute/MyContributions').then(m => ({ default: m.MyContributions })))
const ContributionStatusDetail = lazy(() => import('./features/contribute/ContributionStatusDetail').then(m => ({ default: m.ContributionStatusDetail })))

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
        <Route path="/pengaturan/*" element={<Pengaturan />} />
        <Route path="/styleguide" element={<Styleguide />} />
        
        <Route path="/kontribusi" element={<RequireAuth><ContributeForm /></RequireAuth>} />
        <Route path="/kontribusi/saya" element={<RequireAuth><MyContributions /></RequireAuth>} />
        <Route path="/kontribusi/:id" element={<RequireAuth><ContributionStatusDetail /></RequireAuth>} />
        <Route path="/admin/*" element={<AdminCenter />} />
        
        
        
        
      </Routes>
    </Suspense>
  );
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <SessionTracker /><AppContent />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)




