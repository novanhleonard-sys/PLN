import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<div>Register</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/callback" element={<div>Callback</div>} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/read" element={<div>Read</div>} />
        <Route path="/read/history" element={<div>History</div>} />
        <Route path="/read/:adaptation_id" element={<div>Adaptation Detail</div>} />
        <Route path="/read/:adaptation_id/read" element={<div>Adaptation Read</div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
