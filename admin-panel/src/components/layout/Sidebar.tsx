import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Package, FolderOpen, Image as ImageIcon, 
  FileText, Mail, BookOpen, FileEdit, Settings, LogOut, Menu, X, Users,
  HardDrive, Shield, Layout, Palette, ShoppingBag, Receipt, FileOutput, Upload,
  Bell, Bot
} from "lucide-react";
import { useAdminLogout, useGetAdminStats } from "@workspace/api-client-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Quote Builder", href: "/quote-builder", icon: FileOutput },
  { name: "Invoice Builder", href: "/invoice-builder", icon: Receipt },
  { name: "Products", href: "/products", icon: Package },
  { name: "Import (WP)", href: "/import-products", icon: Upload },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Banners", href: "/banners", icon: ImageIcon },
  { name: "Follow Ups", href: "/follow-ups", icon: Bell },
  { name: "Quote Pipeline", href: "/quote-pipeline", icon: Layout },
  { name: "Clark AI", href: "/clark", icon: Bot },
  { name: "Quotes", href: "/quotes", icon: FileText, badgeKey: "newQuotes" },
  { name: "Leads", href: "/leads", icon: Mail, badgeKey: "newLeads" },
  { name: "Blog", href: "/blog", icon: BookOpen },
  { name: "Pages", href: "/pages", icon: FileEdit },
  { name: "Page Templates", href: "/templates", icon: Layout },
  { name: "Media", href: "/media", icon: HardDrive },
  { name: "Users", href: "/users", icon: Users },
  { name: "Country Blocker", href: "/country-blocker", icon: Shield },
  { name: "Popup Builder", href: "/popups", icon: Layout },
  { name: "Global Styles", href: "/global-styles", icon: Palette },
  { name: "Database", href: "/database", icon: HardDrive },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const [location] = useLocation();
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();
  const { data: stats } = useGetAdminStats();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError: () => setLocation("/login"),
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 border-r border-sidebar-border shadow-md">
      <div className="p-6 pb-4 border-b border-sidebar-border">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Prime Admin
        </h2>
        <p className="text-xs text-sidebar-foreground/50 mt-0.5">primepackagingboxes.com</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          let badgeCount = 0;
          if (stats && item.badgeKey === "newQuotes") badgeCount = (stats as any).newQuotes || 0;
          if (stats && item.badgeKey === "newLeads") badgeCount = (stats as any).newLeads || 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary rounded-l-none pl-[10px]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.name}
              {badgeCount > 0 && (
                <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[18px] text-center">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block h-full relative z-20">
        <SidebarContent />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-sidebar z-50 animate-in slide-in-from-left">
            <button
              className="absolute right-4 top-5 text-white/70 hover:text-white"
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
