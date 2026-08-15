import { ReactNode, lazy, Suspense } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "../ui/WhatsAppButton";
import { AdminInlinePageEditor } from "../AdminInlinePageEditor";

// Lazy-load chat widget — non-critical, deferred after main content
const ChatWidget = lazy(() => import("../ChatWidget").then(m => ({ default: m.ChatWidget })));

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 flex flex-col">
        <AdminInlinePageEditor>{children}</AdminInlinePageEditor>
      </main>
      <Footer />
      <WhatsAppButton />
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  );
}