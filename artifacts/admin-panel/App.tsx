import "./lib/api";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ProductEditPage from "./pages/ProductEditPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryEditPage from "./pages/CategoryEditPage";
import BannersPage from "./pages/BannersPage";
import QuotesPage from "./pages/QuotesPage";
import LeadsPage from "./pages/LeadsPage";
import BlogPage from "./pages/BlogPage";
import BlogEditPage from "./pages/BlogEditPage";
import MediaPage from "./pages/MediaPage";
import CountryBlockerPage from "./pages/CountryBlockerPage";
import TemplatesPage from "./pages/TemplatesPage";
import PagesPage from "./pages/PagesPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";
import GlobalStylesPage from "./pages/GlobalStylesPage";
import PopupBuilderPage from "./pages/PopupBuilderPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";
import QuoteBuilderPage from "./pages/QuoteBuilderPage";
import InvoiceBuilderPage from "./pages/InvoiceBuilderPage";
import ImportProductsPage from "./pages/ImportProductsPage";
import QuotePipelinePage from "./pages/QuotePipelinePage";
import FollowUpsPage from "./pages/FollowUpsPage";
import SecurityPage from "./pages/SecurityPage";
import DatabasePage from "./pages/DatabasePage";
import ClarkPage from "./pages/ClarkPage";
import { AdminLayout } from "./components/layout/AdminLayout";

// Lazy-loaded full-screen builders (outside AdminLayout)
const BuilderPage = lazy(() => import("./builder/GrapesBuilderPage"));
const TemplateBuilderPage = lazy(() => import("./builder/TemplateBuilderPage"));

export default function App() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <ThemeProvider>
    <WouterRouter base={base}>
      <Switch>
        <Route path="/login" component={LoginPage} />

        {/* Full-screen template builder — MUST be before /builder/:id */}
        <Route path="/builder/template/:type">
          {() => (
            <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#0f1117]"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <TemplateBuilderPage />
            </Suspense>
          )}
        </Route>

        {/* Full-screen page builder — NO AdminLayout wrapper */}
        <Route path="/builder/:id">
          {() => (
            <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#0f1117]"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <BuilderPage />
            </Suspense>
          )}
        </Route>

        <Route path="/">
          <DashboardPage />
        </Route>
        <Route path="/products">
          <ProductsPage />
        </Route>
        <Route path="/products/new">
          <ProductEditPage />
        </Route>
        <Route path="/products/:id/edit">
          {(params) => <ProductEditPage />}
        </Route>
        <Route path="/categories">
          <CategoriesPage />
        </Route>
        <Route path="/categories/new">
          <CategoryEditPage />
        </Route>
        <Route path="/categories/:id/edit">
          {() => <CategoryEditPage />}
        </Route>
        <Route path="/banners">
          <BannersPage />
        </Route>
        <Route path="/quotes">
          <QuotesPage />
        </Route>
        <Route path="/leads">
          <LeadsPage />
        </Route>
        <Route path="/blog">
          <BlogPage />
        </Route>
        <Route path="/blog/new">
          <BlogEditPage />
        </Route>
        <Route path="/blog/:id/edit">
          {() => <BlogEditPage />}
        </Route>
        <Route path="/media">
          <MediaPage />
        </Route>
        <Route path="/country-blocker">
          <CountryBlockerPage />
        </Route>
        <Route path="/templates">
          <TemplatesPage />
        </Route>
        <Route path="/pages">
          <PagesPage />
        </Route>
        <Route path="/users">
          <UsersPage />
        </Route>
        <Route path="/settings">
          <SettingsPage />
        </Route>
        <Route path="/global-styles">
          <GlobalStylesPage />
        </Route>
        <Route path="/popups">
          <PopupBuilderPage />
        </Route>
        <Route path="/customers">
          <CustomersPage />
        </Route>
        <Route path="/orders">
          <OrdersPage />
        </Route>
        <Route path="/quote-builder">
          <QuoteBuilderPage />
        </Route>
        <Route path="/invoice-builder">
          <InvoiceBuilderPage />
        </Route>
        <Route path="/import-products">
          <ImportProductsPage />
        </Route>
        <Route path="/follow-ups">
          <FollowUpsPage />
        </Route>
        <Route path="/quote-pipeline">
          <QuotePipelinePage />
        </Route>
        <Route path="/security">
          <SecurityPage />
        </Route>
        <Route path="/database">
          <DatabasePage />
        </Route>
        <Route path="/clark">
          <ClarkPage />
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
    </WouterRouter>
    </ThemeProvider>
  );
}
