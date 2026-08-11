import { Menu, Sun, Moon, LogOut, Bell, Search, Command, Sparkles } from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useTheme } from "../../contexts/ThemeContext";

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
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10 shadow-lg flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            {title}
          </h1>
        </div>
      </div>

      {/* Center Search Command Bar */}
      {onOpenCommandPalette && (
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-rose-500/40 hover:bg-slate-800/90 transition-all duration-200 group shadow-inner"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-rose-400 group-hover:scale-110 transition-transform" />
              Search or jump to...
            </span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-300 bg-slate-800 border border-slate-700 rounded-md group-hover:border-rose-500/50 shadow-sm">
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
          className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 border border-transparent hover:border-white/10"
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

        {/* Dark / Light Toggle */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-150 border border-transparent hover:border-white/10"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark"
            ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" />
            : <Moon className="h-4.5 w-4.5 text-indigo-400" />
          }
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-xl transition-all duration-150 ml-1"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
