import { Menu, Sun, Moon, LogOut, Bell, Search, Command, Monitor, Check } from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useTheme, type Theme } from "../../contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { data: stats } = useGetAdminStats();
  const [roleLabel, setRoleLabel] = useState("");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data?.roleLabel && setRoleLabel(`${data.roleLabel} Portal`))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!themeMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) setThemeMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setThemeMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [themeMenuOpen]);

  const totalNotifs = ((stats as any)?.newQuotes || 0) + ((stats as any)?.newLeads || 0);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError:   () => setLocation("/login"),
    });
  };

  return (
    <header className="z-10 flex h-[74px] flex-shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur-xl sm:px-7">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
           type="button"
           aria-label="Open admin navigation"
           aria-controls="admin-navigation-drawer"
           data-testid="button-open-admin-navigation"
           className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {roleLabel && <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{roleLabel}</span>}
        </div>
      </div>

      {/* Center Search Command Bar */}
      {onOpenCommandPalette && (
        <div className="mx-6 hidden max-w-lg flex-1 items-center sm:flex">
           <button
             onClick={onOpenCommandPalette}
             type="button"
             data-testid="button-admin-search"
              className="group flex w-full items-center justify-between rounded-xl border border-border bg-muted/55 px-4 py-2.5 text-sm text-muted-foreground shadow-inner transition-all duration-200 hover:border-primary/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
           type="button"
           data-testid="button-admin-notifications"
            className="relative rounded-xl border border-transparent p-2.5 text-muted-foreground transition-all duration-150 hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <div ref={themeMenuRef} className="relative">
          <button
             onClick={() => setThemeMenuOpen(open => !open)}
             type="button"
             aria-haspopup="menu"
             aria-expanded={themeMenuOpen}
             data-testid="button-admin-theme-menu"
             className="rounded-xl border border-transparent p-2.5 text-muted-foreground transition-all duration-150 hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
             title={`Theme: ${theme}`}
            aria-label={`Theme: ${theme}`}
          >
            {theme === "system"
              ? <Monitor className="h-4.5 w-4.5 text-primary" />
              : theme === "midnight"
                ? <span className="text-sm">✦</span>
              : resolvedTheme === "dark"
                ? <Sun className="h-4.5 w-4.5 text-amber-400" />
                : <Moon className="h-4.5 w-4.5 text-indigo-500" />
            }
          </button>
           <div role="menu" className={`absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl transition-all ${themeMenuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
            {([
              ["dark", "Dark mode"],
              ["light", "White mode"],
              ["midnight", "Midnight Emerald"],
              ["system", "System mode"],
            ] as [Theme, string][]).map(([value, label]) => (
               <button key={value} onClick={() => { setTheme(value); setThemeMenuOpen(false); }} role="menuitem" type="button" data-testid={`button-theme-${value}`} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2.5 text-left text-sm font-semibold text-popover-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {label} {theme === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
         <button
          onClick={handleLogout}
           type="button"
           data-testid="button-admin-logout"
            className="ml-1 flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-sm font-bold text-muted-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
