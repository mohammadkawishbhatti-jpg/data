import { useEffect } from "react";

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
  ogImage = "https://www.primepackagingboxes.com/wp-content/uploads/2026/04/prime-packaging-og.webp",
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
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("author", "Prime Packaging Boxes");

    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:site_name", "Prime Packaging Boxes", "property");
    setMeta("og:locale", "en_US", "property");
    setMeta("og:locale:alternate", "en_GB", "property");

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);

    // Geo targeting — US + UK
    setMeta("geo.region",    "US");
    setMeta("geo.country",   "US");
    setMeta("geo.placename", "United States");

    const canon = canonical || window.location.href.split("?")[0];
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
    const base = "https://www.primepackagingboxes.com";
    const path = canonical || window.location.pathname;
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
