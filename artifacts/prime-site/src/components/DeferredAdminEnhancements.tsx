import { ReactNode, lazy, Suspense, useEffect, useState } from "react";

const AdminToolbar = lazy(() => import("./layout/AdminToolbar").then(({ AdminToolbar }) => ({ default: AdminToolbar })));
const AdminInlinePageEditor = lazy(() => import("./AdminInlinePageEditor").then(({ AdminInlinePageEditor }) => ({ default: AdminInlinePageEditor })));

type AdminUser = { username?: string; role?: string };

function useDeferredAdminUser() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const loadAdmin = async () => {
      try {
        const response = await fetch("/api/admin/me", { credentials: "include" });
        if (active && response.ok) setAdmin((await response.json()) as AdminUser);
      } catch {
        // Anonymous visitors do not need the admin enhancement bundle.
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => void loadAdmin(), { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(() => void loadAdmin(), 1800);
    }

    return () => {
      active = false;
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return admin;
}

export function DeferredAdminEnhancements({ children }: { children: ReactNode }) {
  const admin = useDeferredAdminUser();

  return (
    <>
      {admin && (
        <Suspense fallback={null}>
          <AdminToolbar admin={admin} />
        </Suspense>
      )}
      {admin && (
        <Suspense fallback={null}>
          <AdminInlinePageEditor adminAuthenticated />
        </Suspense>
      )}
      {children}
    </>
  );
}