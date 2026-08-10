import { Menu, LogOut } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function Topbar({ title, onMenuClick }: { title: string, onMenuClick: () => void }) {
  const logout = useAdminLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
      onError: () => setLocation("/login"),
    });
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card border-b shadow-xs">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
