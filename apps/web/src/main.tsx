import React, { lazy, Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { useAuth } from './features/auth/AuthStore.ts'

import { RequireAuth } from './features/auth/RequireAuth.tsx';
import { SessionTracker } from './features/analytics/SessionTracker';
import { CloudLoadingOverlay } from './features/splash/CloudLoadingOverlay';

import '@fontsource/fredoka/400.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css'

const lazyReload = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      const component = await componentImport();
      return component;
    } catch (error: any) {
      if (
        error.message.includes('Failed to fetch dynamically imported module') ||
        error.message.includes('Importing a module script failed')
      ) {
        if (!sessionStorage.getItem('vite-reload-attempted')) {
          sessionStorage.setItem('vite-reload-attempted', 'true');
          window.location.reload();
          // Return a never-resolving promise to prevent React from throwing while reloading
          return new Promise(() => {});
        } else {
          sessionStorage.removeItem('vite-reload-attempted');
        }
      }
      throw error;
    }
  });
};

const Styleguide = lazyReload(() => import('./routes/styleguide.tsx'))
const Home = lazyReload(() => import('./routes/Home.tsx'))
const Baca = lazyReload(() => import('./features/reader/baca/Baca').then(m => ({ default: m.Baca })))
const Login = lazyReload(() => import('./routes/Login.tsx').then(m => ({ default: m.Login })))
const AdminCenter = lazyReload(() => import('./features/admin/AdminCenter').then(m => ({ default: m.AdminCenter })))

const Profile = lazyReload(() => import('./features/profile/Profile.tsx').then(m => ({ default: m.Profile })))
const Pengaturan = lazyReload(() => import('./features/profile/Pengaturan.tsx').then(m => ({ default: m.Pengaturan })))
const ContributeForm = lazyReload(() => import('./features/contribute/ContributeForm').then(m => ({ default: m.ContributeForm })))
const EditContributionWrapper = lazyReload(() => import('./features/contribute/EditContributionWrapper').then(m => ({ default: m.EditContributionWrapper })))
const MyContributions = lazyReload(() => import('./features/contribute/MyContributions').then(m => ({ default: m.MyContributions })))
const ContributionStatusDetail = lazyReload(() => import('./features/contribute/ContributionStatusDetail').then(m => ({ default: m.ContributionStatusDetail })))

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuth();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <CloudLoadingOverlay />
      <Suspense fallback={null}>
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
        <Route path="/kontribusi/:id/edit" element={<RequireAuth><EditContributionWrapper /></RequireAuth>} />
        <Route path="/admin/*" element={<AdminCenter />} />
      </Routes>
      </Suspense>
    </>
  );
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for(let registration of registrations) { registration.unregister(); }
      console.log('SW unregistered successfully');
    }).catch((err) => {
      console.log('SW unregistration failed: ', err);
    });
  });
}

// Clear reload attempt flag on successful mount
if (sessionStorage.getItem('vite-reload-attempted')) {
  sessionStorage.removeItem('vite-reload-attempted');
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
