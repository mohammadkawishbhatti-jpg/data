import { ReactNode, lazy, Suspense } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "../ui/WhatsAppButton";
import { DeferredAdminEnhancements } from "../DeferredAdminEnhancements";
import { PromotionPopup } from "../PromotionPopup";

// Lazy-load chat widget — non-critical, deferred after main content
const ChatWidget = lazy(() => import("../ChatWidget").then(m => ({ default: m.ChatWidget })));

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <DeferredAdminEnhancements>
      <div className="flex flex-col min-h-[100dvh] w-full">
        <AnnouncementBar />
        <Header />
        <main data-inline-page-root className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsAppButton />
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
        <PromotionPopup />
      </div>
    </DeferredAdminEnhancements>
  );
}