import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

type TawkApi = {
  maximize?: () => void;
  toggle?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  onLoad?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
  }
}

const TAWK_ID_PATTERN = /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?$/;

/**
 * Loads only the official Tawk.to browser embed. The widget is kept hidden
 * while Clark is available so the site has one launcher, not two.
 */
export function TawkWidget() {
  const settings = useSettings();
  const enabled = settings.tawkEnabled === "true";
  const propertyId = settings.tawkPropertyId?.trim() ?? "";

  useEffect(() => {
    if (!enabled || !TAWK_ID_PATTERN.test(propertyId)) return;

    const api = window.Tawk_API || {};
    window.Tawk_API = api;
    let handoffActive = false;
    const hideWidget = () => {
      if (!handoffActive) api.hideWidget?.();
    };
    const onHandoff = () => {
      handoffActive = true;
      api.showWidget?.();
    };
    window.addEventListener("prime-tawk-handoff", onHandoff);

    const existing = document.querySelector<HTMLScriptElement>("script[data-prime-tawk='true']");
    if (existing) {
      hideWidget();
      window.dispatchEvent(new Event("prime-tawk-ready"));
    } else {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://embed.tawk.to/${propertyId}`;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      script.dataset.primeTawk = "true";

      const previousOnLoad = api.onLoad;
      api.onLoad = () => {
        previousOnLoad?.();
        hideWidget();
        window.dispatchEvent(new Event("prime-tawk-ready"));
      };
      document.head.appendChild(script);
    }

    // Tawk can recreate its launcher after route changes or iframe updates.
    // Keep the official launcher hidden until the visitor requests a human.
    const hideTimer = window.setInterval(hideWidget, 500);

    return () => {
      window.clearInterval(hideTimer);
      window.removeEventListener("prime-tawk-handoff", onHandoff);
      // Tawk owns its iframe lifecycle. Hide it when configuration changes;
      // do not remove the provider script or orphan its session.
      if (!handoffActive) api.hideWidget?.();
    };
  }, [enabled, propertyId]);

  return null;
}

export default TawkWidget;