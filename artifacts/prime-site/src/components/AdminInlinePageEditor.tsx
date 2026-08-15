import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useLocation } from "wouter";

const INLINE_DOCUMENT_MARKER = "__prime_inline_page_v1";

const CANONICAL_PAGE_SLUGS: Record<string, string> = {
  "/about": "about-us",
  "/contact": "contact-us",
  "/faq": "faq",
  "/privacy-policy": "privacy-policy",
  "/terms-and-conditions": "terms-and-conditions",
  "/delivery-policy": "delivery-policy",
  "/refund-return-policy": "refund-return-policy",
  "/disclaimer": "disclaimer",
  "/request-sample": "request-sample",
  "/returns-claims-support": "returns-claims-support",
  "/sitemap": "sitemap",
  "/get-a-quote": "get-quote",
};

const EDITABLE_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div", "li",
  "a", "button", "label", "strong", "em", "b", "i", "small", "dt",
  "dd", "th", "td",
].join(",");

type InlineDocument = {
  baseContent: string | null;
  overrides: Record<string, string>;
};

function pageSlugForLocation(location: string): string | null {
  const pathname = location.split("?")[0].replace(/\/+$/, "") || "/";
  if (CANONICAL_PAGE_SLUGS[pathname]) return CANONICAL_PAGE_SLUGS[pathname];
  const cmsMatch = pathname.match(/^\/pages\/([^/]+)$/);
  return cmsMatch ? decodeURIComponent(cmsMatch[1]) : null;
}

function parseInlineDocument(content: unknown): InlineDocument {
  if (typeof content !== "string") return { baseContent: content == null ? null : String(content), overrides: {} };
  try {
    const parsed = JSON.parse(content);
    if (parsed?.[INLINE_DOCUMENT_MARKER] === true && parsed.overrides && typeof parsed.overrides === "object") {
      return {
        baseContent: typeof parsed.baseContent === "string" ? parsed.baseContent : null,
        overrides: parsed.overrides as Record<string, string>,
      };
    }
  } catch {
    // Existing page content is usually HTML. It is intentionally preserved as-is.
  }
  return { baseContent: content, overrides: {} };
}

function elementPath(element: HTMLElement, root: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;
    const tag = current.tagName.toLowerCase();
    const siblings = (Array.from(parent.children) as HTMLElement[]).filter(
      (child) => child.tagName.toLowerCase() === tag,
    );
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parent;
  }
  return parts.join(" > ");
}

function isEditableTextElement(element: HTMLElement): boolean {
  if (!element.textContent?.trim()) return false;
  if (element.children.length > 0) return false;
  if (element.matches("script,style,svg,input,textarea,select")) return false;
  if (element.querySelector("svg,img,input,textarea,select")) return false;
  return true;
}

function editableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(EDITABLE_TAGS))
    .filter(isEditableTextElement);
}

function applyOverrides(root: HTMLElement, overrides: Record<string, string>) {
  Object.entries(overrides).forEach(([path, text]) => {
    const element = root.querySelector<HTMLElement>(path);
    if (element && isEditableTextElement(element)) element.textContent = text;
  });
}

function setEditingState(elements: HTMLElement[], editing: boolean) {
  elements.forEach((element) => {
    if (editing) {
      element.contentEditable = "true";
      element.spellcheck = true;
      element.classList.add("prime-inline-editable");
    } else {
      element.contentEditable = "false";
      element.removeAttribute("contenteditable");
      element.classList.remove("prime-inline-editable");
    }
  });
}

export function AdminInlinePageEditor({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const pageSlug = useMemo(() => pageSlugForLocation(location), [location]);
  const rootRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLElement[]>([]);
  const originalValuesRef = useRef<Map<string, string>>(new Map());
  const storedContentRef = useRef<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pageId, setPageId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAdmin(false);
    setPageId(null);
    setIsEditing(false);
    setSaved(false);
    setError("");
    storedContentRef.current = null;
    elementsRef.current = [];

    if (!pageSlug) return;

    let cancelled = false;
    let intervalId: number | undefined;
    const load = async () => {
      try {
        const [publicResponse, adminResponse] = await Promise.all([
          fetch(`/api/pages/${encodeURIComponent(pageSlug)}`, { credentials: "include" }),
          fetch("/api/admin/me", { credentials: "include" }),
        ]);

        const publicPage = publicResponse.ok ? await publicResponse.json() : null;
        let page = publicPage;
        let admin = false;

        if (adminResponse.ok) {
          admin = true;
          const adminPagesResponse = await fetch("/api/admin/pages", { credentials: "include" });
          if (adminPagesResponse.ok) {
            const adminPages = await adminPagesResponse.json();
            const adminPage = adminPages.find((item: any) => item.slug === pageSlug);
            if (adminPage) {
              page = adminPage;
              if (!cancelled) setPageId(adminPage.id);
            }
          }
        }

        if (cancelled) return;
        setIsAdmin(admin);
        storedContentRef.current = page?.content ?? null;
        const document = parseInlineDocument(page?.content);

        const applyWhenReady = () => {
          if (cancelled || !rootRef.current) return;
          const root = rootRef.current;
          const elements = editableElements(root);
          if (!elements.length) return;
          applyOverrides(root, document.overrides);
          elementsRef.current = editableElements(root);
          if (intervalId) window.clearInterval(intervalId);
        };

        applyWhenReady();
        intervalId = window.setInterval(applyWhenReady, 100);
        window.setTimeout(() => {
          if (intervalId) window.clearInterval(intervalId);
        }, 5000);
      } catch {
        if (!cancelled) setError("Page editor could not connect.");
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      setEditingState(elementsRef.current, false);
    };
  }, [pageSlug]);

  useEffect(() => {
    if (!isEditing) return;
    const root = rootRef.current;
    if (!root) return;

    const elements = editableElements(root);
    elementsRef.current = elements;
    originalValuesRef.current = new Map(
      elements.map((element) => [elementPath(element, root), element.textContent ?? ""]),
    );
    setEditingState(elements, true);

    const preventNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a,button")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const preventLineBreaks = (event: KeyboardEvent) => {
      if (event.key === "Enter") event.preventDefault();
    };
    root.addEventListener("click", preventNavigation, true);
    root.addEventListener("keydown", preventLineBreaks, true);

    return () => {
      root.removeEventListener("click", preventNavigation, true);
      root.removeEventListener("keydown", preventLineBreaks, true);
    };
  }, [isEditing]);

  const startEditing = () => {
    setSaved(false);
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    const root = rootRef.current;
    if (root) {
      originalValuesRef.current.forEach((text, path) => {
        const element = root.querySelector<HTMLElement>(path);
        if (element && isEditableTextElement(element)) element.textContent = text;
      });
    }
    setEditingState(elementsRef.current, false);
    setIsEditing(false);
    setError("");
  };

  const saveEditing = async () => {
    const root = rootRef.current;
    if (!root || pageId == null) {
      setError("This page is not connected to a saved page record yet.");
      return;
    }

    const overrides: Record<string, string> = {};
    elementsRef.current.forEach((element) => {
      overrides[elementPath(element, root)] = element.textContent ?? "";
    });

    const existing = parseInlineDocument(storedContentRef.current);
    const document = {
      [INLINE_DOCUMENT_MARKER]: true,
      baseContent: existing.baseContent,
      overrides: { ...existing.overrides, ...overrides },
    };

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: JSON.stringify(document) }),
      });
      if (!response.ok) throw new Error("Save failed");
      storedContentRef.current = JSON.stringify(document);
      setEditingState(elementsRef.current, false);
      setIsEditing(false);
      setSaved(true);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div ref={rootRef} data-inline-page-root className="contents">
        {children}
      </div>
      {isAdmin && pageId != null && (
        <div
          data-inline-editor-ui
          className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur"
        >
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEditing()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#e63329] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c42a21] disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Page"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2f5a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0d1f3c]"
            >
              <Pencil className="h-4 w-4" /> Edit Page
            </button>
          )}
          {saved && !isEditing && <span className="text-xs font-medium text-emerald-600">Saved</span>}
          {error && <span className="max-w-52 text-xs font-medium text-red-600">{error}</span>}
        </div>
      )}
    </>
  );
}