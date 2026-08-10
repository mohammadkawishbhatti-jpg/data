import "./lib/api";
import { Suspense, lazy } from "react";
import { Switch, Route, Router } from "wouter";
import { ScrollToTop } from "./components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/layout/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SettingsProvider } from "./context/SettingsContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           5 * 60 * 1000,  // 5 min — no re-fetch on every nav
      gcTime:             30 * 60 * 1000,  // keep cache 30 min
      retry:               1,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   false,
    },
  },
});

const HomePage             = lazy(() => import("./pages/HomePage"));
const ProductsPage         = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage    = lazy(() => import("./pages/ProductDetailPage"));
const CategoryPage         = lazy(() => import("./pages/CategoryPage"));
const BlogPage             = lazy(() => import("./pages/BlogPage"));
const BlogPostPage         = lazy(() => import("./pages/BlogPostPage"));
const AboutPage            = lazy(() => import("./pages/AboutPage"));
const ShopPage             = lazy(() => import("./pages/ShopPage"));
const HtmlSitemapPage      = lazy(() => import("./pages/HtmlSitemapPage"));
const CartPage             = lazy(() => import("./pages/CartPage"));
const NotFoundPage         = lazy(() => import("./pages/NotFoundPage"));
const StaticPage           = lazy(() => import("./pages/StaticPage"));
const ContactPage          = lazy(() => import("./pages/ContactPage"));
const PrivacyPage          = lazy(() => import("./pages/PrivacyPage"));
const TermsPage            = lazy(() => import("./pages/TermsPage"));
const DeliveryPolicyPage   = lazy(() => import("./pages/DeliveryPolicyPage"));
const RefundPolicyPage     = lazy(() => import("./pages/RefundPolicyPage"));
const DisclaimerPage       = lazy(() => import("./pages/DisclaimerPage"));
const RequestSamplePage    = lazy(() => import("./pages/RequestSamplePage"));
const ReturnsSupportPage   = lazy(() => import("./pages/ReturnsSupportPage"));
const QuotePage            = lazy(() => import("./pages/QuotePage"));
const FaqPage              = lazy(() => import("./pages/FaqPage"));
const PortalLoginPage      = lazy(() => import("./pages/PortalLoginPage"));
const PortalDashboardPage  = lazy(() => import("./pages/PortalDashboardPage"));
const SmartPage            = lazy(() => import("./pages/SmartPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1a2f5a] border-t-[#e63329] rounded-full animate-spin" />
    </div>
  );
}

/**
 * MainSite — persistent Layout (header + footer mount ONCE).
 * Only the inner page content swaps on navigation.
 * Navigating / → /products → /about never unmounts Header/Footer.
 */
function MainSite() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/shop" component={ShopPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/products/:slug" component={ProductDetailPage} />
          <Route path="/category/:slug" component={CategoryPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          {/* Smart pages — show builder content if saved, else hardcoded fallback */}
          <Route path="/about"                  component={() => <SmartPage slug="about-us"               fallback={AboutPage} />} />
          <Route path="/contact"                component={() => <SmartPage slug="contact-us"             fallback={ContactPage} />} />
          <Route path="/faq"                    component={() => <SmartPage slug="faq"                    fallback={FaqPage} />} />
          <Route path="/privacy-policy"         component={() => <SmartPage slug="privacy-policy"         fallback={PrivacyPage} />} />
          <Route path="/terms-and-conditions"   component={() => <SmartPage slug="terms-and-conditions"   fallback={TermsPage} />} />
          <Route path="/delivery-policy"        component={() => <SmartPage slug="delivery-policy"        fallback={DeliveryPolicyPage} />} />
          <Route path="/refund-return-policy"   component={() => <SmartPage slug="refund-return-policy"   fallback={RefundPolicyPage} />} />
          <Route path="/disclaimer"             component={() => <SmartPage slug="disclaimer"             fallback={DisclaimerPage} />} />
          <Route path="/request-sample"         component={() => <SmartPage slug="request-sample"         fallback={RequestSamplePage} />} />
          <Route path="/returns-claims-support" component={() => <SmartPage slug="returns-claims-support" fallback={ReturnsSupportPage} />} />
          <Route path="/cart" component={CartPage} />
          <Route path="/get-quote" component={QuotePage} />
          <Route path="/sitemap" component={HtmlSitemapPage} />
          <Route path="/pages/:slug" component={StaticPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Portal pages: full-screen, no main nav/footer */}
        <Route path="/portal/login" component={PortalLoginPage} />
        <Route path="/portal/dashboard" component={PortalDashboardPage} />
        <Route path="/portal" component={PortalDashboardPage} />
        {/* All other routes: Layout mounts once, only page content swaps */}
        <Route component={MainSite} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <Router base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <ScrollToTop />
            <AppRoutes />
          </Router>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
