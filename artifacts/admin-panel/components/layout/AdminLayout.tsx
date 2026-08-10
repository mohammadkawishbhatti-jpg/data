import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AuthGuard } from "./AuthGuard";

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
