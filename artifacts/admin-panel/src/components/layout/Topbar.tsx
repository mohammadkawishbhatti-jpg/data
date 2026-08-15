import { Menu, Sun, Moon, LogOut, Bell, Search, Command, Monitor, Check } from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useTheme, type Theme } from "../../contexts/ThemeContext";

export function Topbar({
  title,
  onMenuClick,
  onOpenCommandPalette,
}: {
  title: string;
  onMenuClick: () => void;
  onOpenCommandPalette?: () => void;
}) {
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();
  const { theme, resolvedTheme, setTheme, toggle } = useTheme();
  const { data: stats } = useGetAdminStats();

  const totalNotifs = ((stats as any)?.newQuotes || 0) + ((stats as any)?.newLeads || 0);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError:   () => setLocation("/login"),
    });
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card/90 backdrop-blur-xl border-b border-border shadow-sm flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
           className="md:hidden p-2 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
           <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            {title}
          </h1>
        </div>
      </div>

      {/* Center Search Command Bar */}
      {onOpenCommandPalette && (
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={onOpenCommandPalette}
             className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-muted/55 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted transition-all duration-200 group shadow-inner"
          >
            <span className="flex items-center gap-2">
               <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              Search or jump to...
            </span>
             <kbd className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border border-border rounded-md group-hover:border-primary/50 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Notifications Button */}
        <button
          onClick={() => setLocation("/follow-ups")}
           className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 border border-transparent hover:border-border"
          title="Notifications & Follow ups"
        >
          <Bell className="h-4.5 w-4.5" />
          {totalNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 shadow-md shadow-rose-500"></span>
            </span>
          )}
        </button>

        {/* Theme picker — dark, white, and system mode */}
        <div className="relative group">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 border border-transparent hover:border-border"
            title={`Theme: ${theme}. Click to cycle dark, light, system`}
            aria-label={`Theme: ${theme}`}
          >
            {theme === "system"
              ? <Monitor className="h-4.5 w-4.5 text-primary" />
              : resolvedTheme === "dark"
                ? <Sun className="h-4.5 w-4.5 text-amber-400" />
                : <Moon className="h-4.5 w-4.5 text-indigo-500" />
            }
          </button>
          <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 w-36 rounded-xl border border-border bg-popover p-1.5 opacity-0 shadow-xl transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
            {([
              ["dark", "Dark mode"],
              ["light", "White mode"],
              ["system", "System mode"],
            ] as [Theme, string][]).map(([value, label]) => (
              <button key={value} onClick={() => setTheme(value)} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-popover-foreground hover:bg-muted">
                {label} {theme === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
           className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-primary bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-xl transition-all duration-150 ml-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
