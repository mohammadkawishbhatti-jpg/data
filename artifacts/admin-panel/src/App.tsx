import "./lib/api";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useLocation } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { useGetAdminMe } from "@workspace/api-client-react";

// Keep the authenticated shell small. Each admin workspace is downloaded only
// when its route is opened, which makes login and the first dashboard render
// substantially faster than importing every editor at boot.
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductEditPage = lazy(() => import("./pages/ProductEditPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryEditPage = lazy(() => import("./pages/CategoryEditPage"));
const BannersPage = lazy(() => import("./pages/BannersPage"));
const QuotesPage = lazy(() => import("./pages/QuotesPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogEditPage = lazy(() => import("./pages/BlogEditPage"));
const MediaPage = lazy(() => import("./pages/MediaPage"));
const CountryBlockerPage = lazy(() => import("./pages/CountryBlockerPage"));
const PagesPage = lazy(() => import("./pages/PagesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const GlobalStylesPage = lazy(() => import("./pages/GlobalStylesPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ImportProductsPage = lazy(() => import("./pages/ImportProductsPage"));
const QuotePipelinePage = lazy(() => import("./pages/QuotePipelinePage"));
const FollowUpsPage = lazy(() => import("./pages/FollowUpsPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const DatabasePage = lazy(() => import("./pages/DatabasePage"));
const ClarkPage = lazy(() => import("./pages/ClarkPage"));
const MenusPage = lazy(() => import("./pages/MenusPage"));
const TicketsPage = lazy(() => import("./pages/TicketsPage"));
const InvoiceBuilderPage = lazy(() => import("./pages/InvoiceBuilderPage"));
const QuoteBuilderPage = lazy(() => import("./pages/QuoteBuilderPage"));
const FormsPage = lazy(() => import("./pages/FormsPage"));
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const ContentApprovalsPage = lazy(() => import("./pages/ContentApprovalsPage"));
const ContentPreviewPage = lazy(() => import("./pages/ContentPreviewPage"));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage"));

function WorkspaceLoading() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden="true" />
        <span>Loading workspace…</span>
      </div>
    </div>
  );
}

function AccessDenied({ capability }: { capability: string }) {
  return (
    <AdminLayout title="Access Restricted">
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-destructive/10 px-4 py-2 text-sm font-bold text-destructive">Access restricted</div>
        <h2 className="text-2xl font-bold">You do not have access to this area</h2>
        <p className="mt-2 text-muted-foreground">Your assigned role does not include the <strong>{capability}</strong> workspace. Contact a Super Admin if you need access.</p>
      </div>
    </AdminLayout>
  );
}

function CapabilityGuard({ capability, children }: { capability: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch } = useGetAdminMe({ query: { retry: false, staleTime: 30_000, throwOnError: false } as any });
  useEffect(() => {
    if (!isLoading && !data) setLocation("/login");
  }, [data, isLoading, setLocation]);
  if (isLoading) return <WorkspaceLoading />;
  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="font-bold">Workspace unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">We couldn’t verify your access. Check your connection and try again.</p>
          <button type="button" onClick={() => void refetch()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  }
  const admin = data as any;
  if (!admin) return null;
  if (admin.capabilities?.includes("*") || admin.capabilities?.includes(capability)) return <>{children}</>;
  return <AccessDenied capability={capability} />;
}

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  useEffect(() => {
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
    <ThemeProvider>
    <WouterRouter base={base}>
    <Suspense fallback={<WorkspaceLoading />}>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/preview/:token" component={ContentPreviewPage} />

        <Route path="/">
          <CapabilityGuard capability="dashboard"><DashboardPage /></CapabilityGuard>
        </Route>
        <Route path="/products">
          <CapabilityGuard capability="catalog"><ProductsPage /></CapabilityGuard>
        </Route>
        <Route path="/products/new">
          <CapabilityGuard capability="catalog"><ProductEditPage /></CapabilityGuard>
        </Route>
        <Route path="/products/:id/edit">
          {() => <CapabilityGuard capability="catalog"><ProductEditPage /></CapabilityGuard>}
        </Route>
        <Route path="/categories">
          <CapabilityGuard capability="catalog"><CategoriesPage /></CapabilityGuard>
        </Route>
        <Route path="/categories/new">
          <CapabilityGuard capability="catalog"><CategoryEditPage /></CapabilityGuard>
        </Route>
        <Route path="/categories/:id/edit">
          {() => <CapabilityGuard capability="catalog"><CategoryEditPage /></CapabilityGuard>}
        </Route>
        <Route path="/banners">
          <CapabilityGuard capability="catalog"><BannersPage /></CapabilityGuard>
        </Route>
        <Route path="/quotes">
          <CapabilityGuard capability="sales"><QuotesPage /></CapabilityGuard>
        </Route>
        <Route path="/quote-builder">
          <CapabilityGuard capability="sales"><QuoteBuilderPage /></CapabilityGuard>
        </Route>
        <Route path="/leads">
          <CapabilityGuard capability="sales"><LeadsPage /></CapabilityGuard>
        </Route>
        <Route path="/support-tickets">
          <CapabilityGuard capability="support"><TicketsPage /></CapabilityGuard>
        </Route>
        <Route path="/invoices">
          <CapabilityGuard capability="invoices"><InvoiceBuilderPage /></CapabilityGuard>
        </Route>
        <Route path="/invoice-builder">
          <CapabilityGuard capability="invoices"><InvoiceBuilderPage /></CapabilityGuard>
        </Route>
        <Route path="/forms">
          <CapabilityGuard capability="forms"><FormsPage /></CapabilityGuard>
        </Route>
        <Route path="/blog">
          <CapabilityGuard capability="content"><BlogPage /></CapabilityGuard>
        </Route>
        <Route path="/blog/new">
          <CapabilityGuard capability="content"><BlogEditPage /></CapabilityGuard>
        </Route>
        <Route path="/blog/:id/edit">
          {() => <CapabilityGuard capability="content"><BlogEditPage /></CapabilityGuard>}
        </Route>
        <Route path="/media">
          <CapabilityGuard capability="media"><MediaPage /></CapabilityGuard>
        </Route>
        <Route path="/country-blocker">
          <CapabilityGuard capability="superadmin"><CountryBlockerPage /></CapabilityGuard>
        </Route>
        <Route path="/menus">
          <CapabilityGuard capability="content"><MenusPage /></CapabilityGuard>
        </Route>
        <Route path="/pages">
          <CapabilityGuard capability="content"><PagesPage /></CapabilityGuard>
        </Route>
        <Route path="/users">
          <CapabilityGuard capability="superadmin"><UsersPage /></CapabilityGuard>
        </Route>
        <Route path="/settings">
          <CapabilityGuard capability="superadmin"><SettingsPage /></CapabilityGuard>
        </Route>
        <Route path="/global-styles">
          <CapabilityGuard capability="content"><GlobalStylesPage /></CapabilityGuard>
        </Route>
        <Route path="/customers">
          <CapabilityGuard capability="customers"><CustomersPage /></CapabilityGuard>
        </Route>
        <Route path="/orders">
          <CapabilityGuard capability="sales"><OrdersPage /></CapabilityGuard>
        </Route>
        <Route path="/import-products">
          <CapabilityGuard capability="superadmin"><ImportProductsPage /></CapabilityGuard>
        </Route>
        <Route path="/follow-ups">
          <CapabilityGuard capability="sales"><FollowUpsPage /></CapabilityGuard>
        </Route>
        <Route path="/quote-pipeline">
          <CapabilityGuard capability="sales"><QuotePipelinePage /></CapabilityGuard>
        </Route>
        <Route path="/security">
          <CapabilityGuard capability="superadmin"><SecurityPage /></CapabilityGuard>
        </Route>
        <Route path="/monitoring">
          <CapabilityGuard capability="superadmin"><MonitoringPage /></CapabilityGuard>
        </Route>
        <Route path="/database">
          <CapabilityGuard capability="superadmin"><DatabasePage /></CapabilityGuard>
        </Route>
        <Route path="/clark">
          <CapabilityGuard capability="sales"><ClarkPage /></CapabilityGuard>
        </Route>
        <Route path="/audit-log">
          <CapabilityGuard capability="superadmin"><AuditLogPage /></CapabilityGuard>
        </Route>
        <Route path="/content-approvals">
          <CapabilityGuard capability="content-approval"><ContentApprovalsPage /></CapabilityGuard>
        </Route>
        <Route>
          <AdminLayout title="Not Found">
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <h2 className="text-2xl font-bold mb-2">404 — Page Not Found</h2>
              <p className="text-gray-500 text-center max-w-md">
                The page you are looking for doesn&apos;t exist or has been moved.
              </p>
            </div>
          </AdminLayout>
        </Route>
      </Switch>
    </Suspense>
    </WouterRouter>
    </ThemeProvider>
  );
}
