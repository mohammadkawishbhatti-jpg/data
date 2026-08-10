import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Package, FolderOpen, Image as ImageIcon,
  FileText, Mail, BookOpen, FileEdit, Settings, LogOut, X, Users,
  HardDrive, Shield, Layout, Palette, ShoppingBag, Receipt, FileOutput, Upload,
  Bell, Bot, ChevronDown, TrendingUp, Inbox, Globe
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
      { name: "Quote Builder",  href: "/quote-builder",  icon: FileOutput },
      { name: "Invoice Builder",href: "/invoice-builder",icon: Receipt },
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
      { name: "Page Templates",  href: "/templates",     icon: Layout },
      { name: "Blog",            href: "/blog",          icon: BookOpen },
      { name: "Media",           href: "/media",         icon: HardDrive },
      { name: "Popups",          href: "/popups",        icon: Globe },
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
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
      >
        {section.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>

      {open && (
        <div className="space-y-0.5 mt-0.5">
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
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-primary/5 text-white border-l-[3px] border-primary pl-[9px]"
                    : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                <span className="truncate">{item.name}</span>
                {badge > 0 && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
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
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
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
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/50">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#c0251c] shadow-lg shadow-primary/30">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight leading-none">Prime Admin</h2>
          <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">primepackagingboxes.com</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
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

      {/* Logout */}
      <div className="px-2 pb-4 pt-2 border-t border-sidebar-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-white/5 hover:text-red-400 transition-colors group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block h-full relative z-20 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-sidebar z-50 animate-in slide-in-from-left duration-200">
            <button
              className="absolute right-4 top-5 text-white/50 hover:text-white"
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
