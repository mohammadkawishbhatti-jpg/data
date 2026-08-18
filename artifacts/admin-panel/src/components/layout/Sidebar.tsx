import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, FolderOpen, Image as ImageIcon,
  FileText, BookOpen, FileEdit, Settings, LogOut, X, Users,
   HardDrive, Shield, Palette, ShoppingBag, Upload, ScrollText,
   Bell, Bot, ChevronDown, TrendingUp, Inbox, MessageSquare, Sparkles, Command, Menu as MenuIcon, GitCompare, ClipboardCheck, Activity
} from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";

const sections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard",      href: "/",               icon: LayoutDashboard },
        { name: "Approval Center", href: "/content-approvals", icon: ClipboardCheck, badgeKey: "pendingApprovals", capability: "content-approval" },
      { name: "Quote Pipeline", href: "/quote-pipeline", icon: TrendingUp, capability: "sales" },
      { name: "Follow Ups",     href: "/follow-ups",     icon: Bell, capability: "sales" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Customers",    href: "/customers",     icon: Users, capability: "customers" },
      { name: "Orders",       href: "/orders",        icon: ShoppingBag, capability: "sales" },
      { name: "Quotes",       href: "/quotes",        icon: FileText, badgeKey: "newQuotes", capability: "sales" },
      { name: "Quote Builder",href: "/quote-builder", icon: FileEdit, capability: "sales" },
      { name: "Leads",        href: "/leads",         icon: Inbox, badgeKey: "newLeads", capability: "sales" },
      { name: "Support Tickets", href: "/support-tickets", icon: MessageSquare, capability: "support" },
      { name: "Invoices",      href: "/invoices",      icon: FileText, capability: "invoices" },
      { name: "Form Builder",  href: "/forms",         icon: FileEdit, capability: "forms" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Products",    href: "/products",       icon: Package, capability: "catalog" },
      { name: "Categories",  href: "/categories",     icon: FolderOpen, capability: "catalog" },
      { name: "Banners",     href: "/banners",        icon: ImageIcon, capability: "catalog" },
      { name: "Import (WP)", href: "/import-products",icon: Upload, capability: "superadmin" },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Pages",           href: "/pages",         icon: FileEdit, capability: "content" },
      { name: "Menus",           href: "/menus",         icon: MenuIcon, capability: "content" },
      { name: "Blog",            href: "/blog",          icon: BookOpen, capability: "content" },
      { name: "Media",           href: "/media",         icon: HardDrive, capability: "media" },
      { name: "Global Styles",   href: "/global-styles", icon: Palette, capability: "content" },
       { name: "Content History",  href: "/content-approvals", icon: GitCompare, capability: "content" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Clark AI",        href: "/clark",           icon: Bot, capability: "sales" },
      { name: "Users",           href: "/users",           icon: Users, capability: "superadmin" },
      { name: "Country Blocker", href: "/country-blocker", icon: Shield, capability: "superadmin" },
      { name: "Database",        href: "/database",        icon: HardDrive, capability: "superadmin" },
      { name: "Security",        href: "/security",        icon: Shield, capability: "superadmin" },
      { name: "Monitoring",      href: "/monitoring",      icon: Activity, capability: "superadmin" },
      { name: "Audit Log",       href: "/audit-log",       icon: ScrollText, capability: "superadmin" },
      { name: "Settings",        href: "/settings",        icon: Settings, capability: "superadmin" },
    ],
  },
];

function NavSection({
  section, location, stats, capabilities, onClose, open, onToggle, accessLoading,
}: {
  section: typeof sections[0];
  location: string;
  stats: any;
  capabilities: string[];
  onClose: () => void;
  open: boolean;
  onToggle: () => void;
  accessLoading: boolean;
}) {
  const visibleItems = accessLoading
    ? section.items
    : section.items.filter((item: any) =>
      !item.capability || capabilities.includes("*") || capabilities.includes(item.capability)
    );
  if (!visibleItems.length) return null;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`admin-nav-${section.label.toLowerCase().replace(/\s+/g, "-")}`}
        data-testid={`button-toggle-admin-section-${section.label.toLowerCase()}`}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/30 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        {section.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>

      {open && (
        <div id={`admin-nav-${section.label.toLowerCase().replace(/\s+/g, "-")}`} className="space-y-1 mt-1">
          {visibleItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            let badge = 0;
            if (stats && (item as any).badgeKey === "newQuotes") badge = (stats as any).newQuotes || 0;
            if (stats && (item as any).badgeKey === "newLeads")  badge = (stats as any).newLeads  || 0;
            if (stats && (item as any).badgeKey === "pendingApprovals") badge = (stats as any).pendingApprovals || 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                data-testid={`link-admin-nav-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                data-admin-nav-item="true"
                data-active={isActive ? "true" : "false"}
                className={`group relative flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                     ? "bg-sidebar-primary/15 text-sidebar-foreground border-l-2 border-sidebar-primary shadow-md shadow-sidebar-primary/10"
                     : "text-sidebar-foreground/65 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground"
                }`}
              >
                 <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}`} />
                <span className="truncate">{item.name}</span>
                {badge > 0 && (
                  <span className="ml-auto bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-rose-500/30">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
  onOpenCommandPalette,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  onOpenCommandPalette?: () => void;
}) {
  const [location] = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();
  const { data: stats } = useGetAdminStats();
  const [access, setAccess] = useState<{ roleLabel?: string; capabilities: string[] }>({ capabilities: [] });
  const [accessLoading, setAccessLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const defaults = Object.fromEntries(sections.map(section => [section.label, true]));
    try {
      const stored = window.sessionStorage.getItem("prime-admin-open-sections");
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (cancelled) return;
        if (data) setAccess({ roleLabel: data.roleLabel, capabilities: data.capabilities || [] });
        setAccessLoading(false);
      })
      .catch(() => {
        if (!cancelled) setAccessLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem("prime-admin-open-sections", JSON.stringify(openSections));
    } catch {
      // Session storage is optional; navigation remains fully functional without it.
    }
  }, [openSections]);

  useEffect(() => {
    const activeSection = sections.find(section => section.items.some(item =>
      location === item.href || (item.href !== "/" && location.startsWith(item.href))
    ));
    if (!activeSection) return;
    setOpenSections(current => current[activeSection.label] === false
      ? { ...current, [activeSection.label]: true }
      : current
    );
    const frame = requestAnimationFrame(() => {
      navRef.current?.querySelector<HTMLElement>('[data-admin-nav-item="true"][data-active="true"]')?.scrollIntoView({
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError:   () => setLocation("/login"),
    });
  };

  const SidebarContent = () => (
     <div className="flex h-full w-[17.5rem] max-w-[calc(100vw-1rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
      {/* Brand Header */}
       <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center gap-3">
           <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/30 bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-500/30">
            <Package className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <div>
              <h2 className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-sidebar-foreground">
              Prime Admin
              <Sparkles className="h-3 w-3 text-rose-400" />
            </h2>
              <p className="mt-0.5 text-[10px] text-sidebar-foreground/60">primepackagingboxes.com</p>
             {access.roleLabel && <span className="mt-1 inline-flex rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sidebar-primary">{access.roleLabel}</span>}
          </div>
        </div>
      </div>

      {/* Quick Command Trigger */}
      {onOpenCommandPalette && (
        <div className="px-3 pt-3">
          <button
            onClick={onOpenCommandPalette}
             type="button"
             data-testid="button-admin-quick-search"
             className="group flex w-full items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/45 px-3 py-2.5 text-xs text-sidebar-foreground/65 shadow-inner transition-all duration-150 hover:bg-sidebar-accent/75 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="flex items-center gap-2">
              <Command className="h-3.5 w-3.5 text-rose-400" />
              Quick Search
            </span>
             <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-sidebar-foreground/65 bg-sidebar-accent border border-sidebar-border rounded group-hover:border-sidebar-primary/40">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Nav List */}
       <nav ref={navRef} aria-label="Admin navigation" className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-3 py-3 scrollbar-thin">
        {sections.map(section => (
          <NavSection
            key={section.label}
            section={section}
            location={location}
            stats={stats}
            capabilities={access.capabilities}
            onClose={() => setMobileOpen(false)}
             open={openSections[section.label] !== false}
             onToggle={() => setOpenSections(current => ({ ...current, [section.label]: current[section.label] === false }))}
             accessLoading={accessLoading}
          />
        ))}
      </nav>

      {/* Footer / Sign Out */}
       <div className="px-3 pb-4 pt-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <button
          onClick={handleLogout}
          type="button"
          data-testid="button-admin-sign-out"
          className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-xs font-semibold text-sidebar-foreground/65 transition-all duration-150 hover:border-sidebar-primary/20 hover:bg-sidebar-primary/10 hover:text-sidebar-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
           <LogOut className="h-4 w-4 text-sidebar-foreground/60 group-hover:text-sidebar-primary transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full relative z-20 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div id="admin-navigation-drawer" className="relative z-50 w-[17.5rem] max-w-[calc(100vw-1rem)] animate-in slide-in-from-left duration-200 bg-[#090d16]">
            <button
              ref={closeButtonRef}
              className="absolute right-4 top-5 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
