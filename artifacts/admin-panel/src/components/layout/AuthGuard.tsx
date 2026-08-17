import { useGetAdminMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = useGetAdminMe({ query: { retry: false, staleTime: 30_000, throwOnError: false } as any });
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(async () => {
    try { await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" }); } catch {}
    setLocation("/login");
  }, [setLocation]);

  const resetIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (!data) return;
    // Start idle timer — reset on any user activity
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [data, resetIdle]);

  useEffect(() => {
    if (error) setLocation("/login");
  }, [error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading your workspace…
        </div>
      </div>
    );
  }
  if (!data) return null;
  return <>{children}</>;
}
