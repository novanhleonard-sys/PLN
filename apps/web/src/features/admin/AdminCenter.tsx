import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminPengaturan } from './AdminPengaturan';
import { AdminKelola } from './AdminKelola';
import { AdminAntrean } from './AdminAntrean';
import { AdminKonten } from './AdminKonten';
import { AdminEditKonten } from './AdminEditKonten';
import { AdminGayaAI } from './AdminGayaAI';
import { AdminLaporan } from './AdminLaporan';
import { AdminPustakaSuara } from './AdminPustakaSuara';

export function AdminCenter() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/antrean" element={<AdminAntrean />} />
        <Route path="/konten" element={<AdminKonten />} />
        <Route path="/konten/edit/:id" element={<AdminEditKonten />} />
        <Route path="/gaya-ai" element={<AdminGayaAI />} />
        <Route path="/pengaturan" element={<AdminPengaturan />} />
        <Route path="/kelola" element={<AdminKelola />} />
        <Route path="/laporan" element={<AdminLaporan />} />
        <Route path="/pustaka-suara" element={<AdminPustakaSuara />} />
      </Routes>
    </AdminLayout>
  );
}
