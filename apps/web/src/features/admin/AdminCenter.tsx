import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminPengaturan } from './AdminPengaturan';
import { AdminKelola } from './AdminKelola';

export function AdminCenter() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/pengaturan" element={<AdminPengaturan />} />
        <Route path="/kelola" element={<AdminKelola />} />
      </Routes>
    </AdminLayout>
  );
}
