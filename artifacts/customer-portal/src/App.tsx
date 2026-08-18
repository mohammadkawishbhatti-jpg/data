import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/Layout';
import OrdersPage from '@/pages/OrdersPage';
import QuotesPage from '@/pages/QuotesPage';
import InvoicesPage from '@/pages/InvoicesPage';
import ProfilePage from '@/pages/ProfilePage';
import OrderDetailPage from '@/pages/OrderDetailPage';

const base = import.meta.env.BASE_URL;

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { customer, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--primary)' }}>
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
  return customer ? <>{children}</> : <Navigate to="/" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { customer, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center" style={{ background: 'var(--primary)' }}>
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
  return customer ? <Navigate to="/orders" replace /> : <>{children}</>;
}

export default function App() {
  React.useEffect(() => {
    const report = (message: string, name?: string) => {
      void fetch("/api/monitoring/frontend-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.slice(0, 500), name, route: window.location.pathname, browser: navigator.userAgent.slice(0, 200) }),
      }).catch(() => undefined);
    };
    const onError = (event: ErrorEvent) => report(event.message || "Unhandled browser error", event.error?.name);
    const onRejection = (event: PromiseRejectionEvent) => report(String(event.reason || "Unhandled promise rejection"), "UnhandledRejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return (
    <BrowserRouter basename={base}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
