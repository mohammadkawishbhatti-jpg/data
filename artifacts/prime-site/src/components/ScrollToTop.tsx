import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Scrolls to top on every route change — no shimmer, instant reset.
 * Mount this once inside <Router> so it picks up wouter's location context.
 */
export function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}
