import { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "../ui/WhatsAppButton";
import { ChatWidget } from "../ChatWidget";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </div>
  );
}