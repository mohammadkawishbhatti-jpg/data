import { Menu, Sun, Moon, LogOut, Bell } from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useTheme } from "../../contexts/ThemeContext";

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();
  const { theme, toggle } = useTheme();
  const { data: stats } = useGetAdminStats();

  const totalNotifs = ((stats as any)?.newQuotes || 0) + ((stats as any)?.newLeads || 0);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError:   () => setLocation("/login"),
    });
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-card border-b border-border/60 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* Notifications */}
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
          {totalNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <Sun  className="h-4 w-4 text-yellow-400" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
