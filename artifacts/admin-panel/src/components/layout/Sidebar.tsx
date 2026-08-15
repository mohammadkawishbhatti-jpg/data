import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, FolderOpen, Image as ImageIcon,
  FileText, BookOpen, FileEdit, Settings, LogOut, X, Users,
  HardDrive, Shield, Palette, ShoppingBag, Upload,
  Bell, Bot, ChevronDown, TrendingUp, Inbox, Sparkles, Command, Menu as MenuIcon
} from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";

const sections = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard",      href: "/",               icon: LayoutDashboard },
      { name: "Quote Pipeline", href: "/quote-pipeline", icon: TrendingUp },
      { name: "Follow Ups",     href: "/follow-ups",     icon: Bell },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Customers",    href: "/customers",     icon: Users },
      { name: "Orders",       href: "/orders",        icon: ShoppingBag },
      { name: "Quotes",       href: "/quotes",        icon: FileText, badgeKey: "newQuotes" },
      { name: "Leads",        href: "/leads",         icon: Inbox,    badgeKey: "newLeads" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Products",    href: "/products",       icon: Package },
      { name: "Categories",  href: "/categories",     icon: FolderOpen },
      { name: "Banners",     href: "/banners",        icon: ImageIcon },
      { name: "Import (WP)", href: "/import-products",icon: Upload },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Pages",           href: "/pages",         icon: FileEdit },
      { name: "Menus",           href: "/menus",         icon: MenuIcon },
      { name: "Blog",            href: "/blog",          icon: BookOpen },
      { name: "Media",           href: "/media",         icon: HardDrive },
      { name: "Global Styles",   href: "/global-styles", icon: Palette },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Clark AI",        href: "/clark",           icon: Bot },
      { name: "Users",           href: "/users",           icon: Users },
      { name: "Country Blocker", href: "/country-blocker", icon: Shield },
      { name: "Database",        href: "/database",        icon: HardDrive },
      { name: "Security",        href: "/security",        icon: Shield },
      { name: "Settings",        href: "/settings",        icon: Settings },
    ],
  },
];

function NavSection({
  section, location, stats, onClose,
}: {
  section: typeof sections[0];
  location: string;
  stats: any;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(o => !o)}
         className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {section.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>

      {open && (
        <div className="space-y-1 mt-1">
          {section.items.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            let badge = 0;
            if (stats && (item as any).badgeKey === "newQuotes") badge = (stats as any).newQuotes || 0;
            if (stats && (item as any).badgeKey === "newLeads")  badge = (stats as any).newLeads  || 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();
  const { data: stats } = useGetAdminStats();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError:   () => setLocation("/login"),
    });
  };

  const SidebarContent = () => (
     <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-2xl">
      {/* Brand Header */}
       <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border bg-sidebar-accent/20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 border border-rose-400/30">
            <Package className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          </div>
          <div>
             <h2 className="text-sm font-bold tracking-tight text-sidebar-foreground flex items-center gap-1.5">
              Prime Admin
              <Sparkles className="h-3 w-3 text-rose-400" />
            </h2>
             <p className="text-[10px] text-sidebar-foreground/60 mt-0.5">primepackagingboxes.com</p>
          </div>
        </div>
      </div>

      {/* Quick Command Trigger */}
      {onOpenCommandPalette && (
        <div className="px-3 pt-3">
          <button
            onClick={onOpenCommandPalette}
             className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sidebar-accent/45 border border-sidebar-border text-xs text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent/75 transition-all duration-150 group shadow-inner"
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
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        {sections.map(section => (
          <NavSection
            key={section.label}
            section={section}
            location={location}
            stats={stats}
            onClose={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Footer / Sign Out */}
       <div className="px-3 pb-4 pt-3 border-t border-sidebar-border bg-sidebar-accent/20">
        <button
          onClick={handleLogout}
           className="flex items-center gap-2.5 px-3 py-2 w-full rounded-xl text-xs font-semibold text-sidebar-foreground/65 hover:bg-sidebar-primary/10 hover:text-sidebar-primary border border-transparent hover:border-sidebar-primary/20 transition-all duration-150 group"
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
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-[#090d16] z-50 animate-in slide-in-from-left duration-200">
            <button
              className="absolute right-4 top-5 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
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
