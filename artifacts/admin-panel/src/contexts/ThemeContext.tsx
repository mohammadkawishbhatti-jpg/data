import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "midnight" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("prime-admin-theme") as Theme) || "dark";
    } catch {
      return "dark";
    }
  });
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true
  );
  const resolvedTheme = theme === "system"
    ? (systemDark ? "dark" : "light")
    : theme === "light" ? "light" : "dark";

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.adminTheme = theme;
    try {
      localStorage.setItem("prime-admin-theme", theme);
    } catch {}
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  const toggle = () => setTheme(t => t === "dark" ? "light" : t === "light" ? "midnight" : t === "midnight" ? "system" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
