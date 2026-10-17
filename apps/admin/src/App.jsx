import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import DashboardView from './views/DashboardView';
import UsersView from './views/UsersView';
import ApiCatalogueView from './views/ApiCatalogueView';
import PaymentsView from './views/PaymentsView';
import CertificatesView from './views/CertificatesView';
import AuditLogsView from './views/AuditLogsView';
import ExportsView from './views/ExportsView';
import { Loader2 } from 'lucide-react';

function AdminAppRoutes() {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-mono text-neutral-400">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!adminUser || adminUser.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/apis" element={<ApiCatalogueView />} />
        <Route path="/payments" element={<PaymentsView />} />
        <Route path="/certificates" element={<CertificatesView />} />
        <Route path="/audit-logs" element={<AuditLogsView />} />
        <Route path="/exports" element={<ExportsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AdminAppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}
