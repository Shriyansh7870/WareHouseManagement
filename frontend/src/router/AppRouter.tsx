import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';

const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const InventoryPage = lazy(() => import('../pages/Inventory/InventoryPage'));
const GRNPage = lazy(() => import('../pages/GRN/GRNPage'));
const QAPage = lazy(() => import('../pages/QualityAssurance/QAPage'));
const ColdChainPage = lazy(() => import('../pages/ColdChain/ColdChainPage'));
const DispatchPage = lazy(() => import('../pages/Dispatch/DispatchPage'));
const VendorsPage = lazy(() => import('../pages/Vendors/VendorsPage'));
const DocumentsPage = lazy(() => import('../pages/Documents/DocumentsPage'));
const CycleCountPage = lazy(() => import('../pages/CycleCount/CycleCountPage'));
const ReturnsPage = lazy(() => import('../pages/Returns/ReturnsPage'));
const AIAnalyticsPage = lazy(() => import('../pages/AIAnalytics/AIAnalyticsPage'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const AuditTrailPage = lazy(() => import('../pages/AuditTrail/AuditTrailPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-[#D4A847] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="grn" element={<GRNPage />} />
            <Route path="qa" element={<QAPage />} />
            <Route path="cold-chain" element={<ColdChainPage />} />
            <Route path="dispatch" element={<DispatchPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="cycle-count" element={<CycleCountPage />} />
            <Route path="ai-analytics" element={<AIAnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit" element={<AuditTrailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
