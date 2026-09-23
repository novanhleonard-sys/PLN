import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ErrorBoundary } from './ErrorBoundary.tsx'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary><Suspense fallback={<div className="p-8 text-text-muted">Memuat...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cerita/:slug" element={<Home />} />
          <Route path="/baca/:slug" element={<div className="p-8">Membaca placeholder</div>} />
          <Route path="/styleguide" element={<Styleguide />} />
          
          <Route path="/register" element={<div>Register</div>} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/callback" element={<div>Callback</div>} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/read" element={<div>Read</div>} />
          <Route path="/read/history" element={<div>History</div>} />
          <Route path="/read/:adaptation_id" element={<div>Adaptation Detail</div>} />
          <Route path="/read/:adaptation_id/read" element={<div>Adaptation Read</div>} />
        </Routes>
      </Suspense></ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
