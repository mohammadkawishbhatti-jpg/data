import { useEffect } from "react";

export const SITE_ORIGIN = "https://www.primepackagingboxes.com";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/api/uploads/cardboard-gift-boxes.webp`;

export function toAbsoluteUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return value;
  }
}

interface SEOParams {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  keywords?: string;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO({
  title,
  description = "Custom packaging boxes with free design support, low minimums, and fast US shipping. Get a free quote today.",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  keywords,
}: SEOParams) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | Prime Packaging Boxes`
      : "Prime Packaging Boxes — Custom Packaging That Sells Your Brand";

    document.title = fullTitle;

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large");
    setMeta("author", "Prime Packaging Boxes");
    const resolvedOgImage = toAbsoluteUrl(ogImage) || DEFAULT_OG_IMAGE;

    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", resolvedOgImage, "property");
    setMeta("og:image:secure_url", resolvedOgImage, "property");
    setMeta("og:image:type", resolvedOgImage.endsWith(".webp") ? "image/webp" : "image/jpeg", "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:image:alt", `${title} — Prime Packaging Boxes`, "property");
    setMeta("og:site_name", "Prime Packaging Boxes", "property");
    setMeta("og:locale", "en_US", "property");
    setMeta("og:locale:alternate", "en_GB", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", resolvedOgImage);

    // Geo targeting — US + UK
    setMeta("geo.region",    "US");
    setMeta("geo.country",   "US");
    setMeta("geo.placename", "United States");

    const canon = toAbsoluteUrl(canonical || window.location.href.split("?")[0]) || window.location.href.split("?")[0];
    setLink("canonical", canon);
    setMeta("og:url", canon, "property");

    // hreflang — same content served to both US and UK audiences
    const setHreflang = (lang: string, href: string) => {
      const id = `hreflang-${lang}`;
      let el = document.querySelector(`link[hreflang="${lang}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", lang);
        el.setAttribute("data-hreflang-dynamic", "true");
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };
    const base = SITE_ORIGIN;
    let path = window.location.pathname;
    if (canonical) {
      try {
        path = new URL(canonical, SITE_ORIGIN).pathname;
      } catch {
        path = canonical;
      }
    }
    setHreflang("en-us",    base + path);
    setHreflang("en-gb",    base + path);
    setHreflang("en",       base + path);
    setHreflang("x-default", base + path);
  }, [title, description, canonical, ogImage, ogType, noindex, keywords]);
}

export function useSchemaOrg(schema: object) {
  useEffect(() => {
    if (!schema || Object.keys(schema).length === 0) return;
    const id = "schema-org-jsonld";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => { el?.remove(); };
  }, [JSON.stringify(schema)]);
}
