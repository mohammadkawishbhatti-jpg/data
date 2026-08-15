import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AuthGuard } from "./AuthGuard";
import { CommandPalette } from "./CommandPalette";

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AuthGuard>
      <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onOpenCommandPalette={() => setCmdOpen(true)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            title={title}
            onMenuClick={() => setMobileOpen(true)}
            onOpenCommandPalette={() => setCmdOpen(true)}
          />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="mx-auto min-w-0 max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* Global Spotlight Search Modal */}
        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      </div>
    </AuthGuard>
  );
}
