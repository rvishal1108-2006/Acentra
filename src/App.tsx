import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { QueuesPage } from './pages/QueuesPage';
import { WorkersPage } from './pages/WorkersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditPage } from './pages/AuditPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { LoadTestPage } from './pages/LoadTestPage';
import { SettingsPage } from './pages/SettingsPage';
import { Button } from './components/ui/Button';
import { Compass, ArrowLeft } from 'lucide-react';
import { useStore } from './store/useStore';

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center ring-8 ring-indigo-500/5">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm">
        The requested routing node does not exist in the Acentra operational network topology.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Live Dashboard
        </Button>
      </Link>
    </div>
  );
}

export function App() {
  const theme = useStore((s) => s.theme);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="queues" element={<QueuesPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="portal" element={<CustomerPortalPage />} />
            <Route path="loadtest" element={<LoadTestPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Enterprise Toast Notifications */}
      <Toaster
        position="bottom-right"
        theme={theme}
        richColors
        closeButton
      />
    </ErrorBoundary>
  );
}

export default App;
