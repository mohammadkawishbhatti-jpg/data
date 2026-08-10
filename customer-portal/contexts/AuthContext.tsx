import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, clearStoredCookie, fetchPortalMe, portalLogin, portalLogout } from '@/lib/api';

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await fetchPortalMe();
        if (mounted) setCustomer(me);
      } catch {
        // not authenticated — clear any stale cookie silently
        await clearStoredCookie();
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (username: string, password: string) => {
    const data = await portalLogin(username, password);
    setCustomer(data.customer);
  };

  const logout = async () => {
    await portalLogout();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
