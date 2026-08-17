import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Eraser,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pencil,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

const INLINE_DOCUMENT_MARKER = "__prime_inline_page_v1";

const CANONICAL_PAGE_SLUGS: Record<string, string> = {
  "/": "home",
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
  "dd", "th", "td", "ul", "ol", "blockquote",
].join(",");
const INLINE_FORMATTING_TAGS = new Set([
  "a", "b", "br", "em", "i", "mark", "s", "span", "strong", "u",
]);
const ALLOWED_RICH_TAGS = new Set([
  "a", "b", "blockquote", "br", "em", "h1", "h2", "h3", "h4", "h5",
  "h6", "i", "li", "mark", "ol", "p", "s", "strong", "u", "ul",
]);
const INLINE_OVERRIDE_MARKER = "__prime_inline_override_v1";

type InlineDocument = {
  baseContent: string | null;
  overrides: Record<string, string>;
};

type TemplateType = "product" | "category" | "shop" | "blog";

type ContentResource =
  | { kind: "page"; slug: string; id: number }
  | { kind: "template"; type: TemplateType };

function pathnameForLocation(location: string): string {
  return location.split("?")[0].replace(/\/+$/, "") || "/";
}

function pageSlugForPathname(pathname: string): string | null {
  if (CANONICAL_PAGE_SLUGS[pathname]) return CANONICAL_PAGE_SLUGS[pathname];
  const cmsMatch = pathname.match(/^\/pages\/([^/]+)$/);
  return cmsMatch ? decodeURIComponent(cmsMatch[1]) : null;
}

function directTemplateTypeForPathname(pathname: string): TemplateType | null {
  if (pathname === "/products" || pathname === "/shop") return "shop";
  if (pathname === "/blog") return "blog";
  if (pathname.startsWith("/products/")) return "product";
  return null;
}

function templateLabel(type: TemplateType): string {
  return type === "product" ? "Product" : type === "category" ? "Category" : type === "shop" ? "Shop" : "Blog";
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
  if (element.closest("[data-inline-dynamic='true']")) return false;
  if (!element.textContent?.trim()) return false;
  if (element.matches("script,style,svg,img,input,textarea,select,video,iframe")) return false;
  if (element.querySelector("script,style,svg,img,input,textarea,select,video,iframe")) return false;
  if (element.children.length > 0) {
    const tag = element.tagName.toLowerCase();
    const hasOnlyFormatting = tag === "ul" || tag === "ol"
      ? Array.from(element.children).every((child) => child.tagName.toLowerCase() === "li")
      : tag === "blockquote"
        ? Array.from(element.children).every((child) => ["p", "div", "span"].includes(child.tagName.toLowerCase()))
        : Array.from(element.children).every((child) =>
          INLINE_FORMATTING_TAGS.has(child.tagName.toLowerCase()),
        );
    if (!hasOnlyFormatting) return false;
  }
  return true;
}

function editableElements(root: HTMLElement): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(EDITABLE_TAGS))
    .filter(isEditableTextElement);
  return candidates.filter((element) => {
    const ancestor = element.parentElement?.closest<HTMLElement>(EDITABLE_TAGS);
    return !ancestor || !isEditableTextElement(ancestor);
  });
}

function contentRootForResource(root: HTMLElement, resource: ContentResource | null): HTMLElement {
  if (resource?.kind === "template") {
    return root.querySelector<HTMLElement>("[data-inline-template-root]") ?? root;
  }
  return root;
}

function sanitizeRichHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  const clean = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) return;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        child.remove();
        return;
      }
      const element = child as HTMLElement;
      const tag = element.tagName.toLowerCase();
      if (!ALLOWED_RICH_TAGS.has(tag)) {
        if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object") {
          element.remove();
        } else {
          while (element.firstChild) element.parentNode?.insertBefore(element.firstChild, element);
          element.remove();
        }
        return;
      }
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const allowed = tag === "a" && ["href", "target", "rel", "title"].includes(name);
        if (!allowed) element.removeAttribute(attribute.name);
      });
      if (tag === "a") {
        const href = element.getAttribute("href")?.trim() ?? "";
        if (href && !/^(https?:|mailto:|tel:|\/|#)/i.test(href)) {
          element.removeAttribute("href");
        }
        if (element.getAttribute("target") === "_blank") {
          element.setAttribute("rel", "noopener noreferrer");
        }
      }
      clean(element);
    });
  };
  clean(template.content);
  return template.innerHTML;
}

function parseOverride(value: string, fallbackTag: string): { tag: string; html: string } {
  try {
    const parsed = JSON.parse(value);
    if (parsed?.[INLINE_OVERRIDE_MARKER] === true && typeof parsed.html === "string") {
      return {
        tag: typeof parsed.tag === "string" && /^(h[1-6]|p|div|span|li|a|button|label|small|dt|dd|th|td|ul|ol|blockquote)$/i.test(parsed.tag)
          ? parsed.tag.toLowerCase()
          : fallbackTag,
        html: sanitizeRichHtml(parsed.html),
      };
    }
  } catch {
    // Older revisions stored plain text. It remains valid rich-text content.
  }
  return { tag: fallbackTag, html: sanitizeRichHtml(value) };
}

function serializeOverride(element: HTMLElement): string {
  return JSON.stringify({
    [INLINE_OVERRIDE_MARKER]: true,
    tag: element.tagName.toLowerCase(),
    html: sanitizeRichHtml(element.innerHTML),
  });
}

function applyOverrides(root: HTMLElement, overrides: Record<string, string>) {
  Object.entries(overrides).forEach(([path, value]) => {
    const element = root.querySelector<HTMLElement>(path);
    if (!element || !isEditableTextElement(element)) return;
    const override = parseOverride(value, element.tagName.toLowerCase());
    if (override.tag !== element.tagName.toLowerCase()) {
      const replacement = document.createElement(override.tag);
      Array.from(element.attributes).forEach((attribute) => {
        if (attribute.name !== "contenteditable") replacement.setAttribute(attribute.name, attribute.value);
      });
      replacement.dataset.inlineOverridePath = path;
      replacement.innerHTML = override.html;
      element.replaceWith(replacement);
    } else {
      element.innerHTML = override.html;
      element.dataset.inlineOverridePath = path;
    }
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
      delete element.dataset.inlineOverridePath;
    }
  });
}

function stableElementPath(element: HTMLElement, root: HTMLElement): string {
  return element.dataset.inlineOverridePath || elementPath(element, root);
}

export function AdminInlinePageEditor({ adminAuthenticated }: { adminAuthenticated: boolean }) {
  const [location] = useLocation();
  const pathname = useMemo(() => pathnameForLocation(location), [location]);
  const pageSlug = useMemo(() => pageSlugForPathname(pathname), [pathname]);
  const rootRef = useRef<HTMLElement | null>(null);
  const elementsRef = useRef<HTMLElement[]>([]);
  const originalValuesRef = useRef<Map<string, string>>(new Map());
  const storedContentRef = useRef<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(adminAuthenticated);
  const [resource, setResource] = useState<ContentResource | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeBlock, setActiveBlock] = useState("p");
  const [activeMarks, setActiveMarks] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });

  const refreshToolbarState = () => {
    try {
      const selection = window.getSelection();
      const anchor = selection?.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : selection?.anchorNode?.parentElement;
      const editable = anchor?.closest<HTMLElement>("[contenteditable='true']");
      if (editable) {
        setActiveBlock(editable.tagName.toLowerCase());
        setActiveMarks({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
          strikeThrough: document.queryCommandState("strikeThrough"),
        });
      } else {
        setActiveMarks({ bold: false, italic: false, underline: false, strikeThrough: false });
      }
    } catch {
      // Browser selection APIs are not available during some focus transitions.
    }
  };

  const runCommand = (command: string, value?: string) => {
    if (!isEditing) return;
    document.execCommand(command, false, value);
    refreshToolbarState();
    setSaved(false);
  };

  const insertLink = () => {
    const selection = window.getSelection();
    const existingLink = selection?.anchorNode instanceof HTMLElement
      ? selection.anchorNode.closest("a")
      : selection?.anchorNode?.parentElement?.closest("a");
    const url = window.prompt("Enter a safe link URL", existingLink?.getAttribute("href") ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed || !/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) {
      setError("Use an https, mailto, tel, relative, or anchor link.");
      return;
    }
    runCommand("createLink", trimmed);
    setError("");
  };

  useEffect(() => {
    setIsAdmin(false);
    setResource(null);
    setIsEditing(false);
    setSaved(false);
    setError("");
    storedContentRef.current = null;
    elementsRef.current = [];

    let cancelled = false;
    let intervalId: number | undefined;
    rootRef.current = document.querySelector<HTMLElement>("[data-inline-page-root]");
    const load = async () => {
      try {
        let resolvedTemplateType = directTemplateTypeForPathname(pathname);
        if (!pageSlug && !resolvedTemplateType) {
          const slugMatch = pathname.match(/^\/([^/]+)$/);
          if (slugMatch) {
            const resolveResponse = await fetch(`/api/resolve/${encodeURIComponent(slugMatch[1])}`);
            if (resolveResponse.ok) {
              const resolved = await resolveResponse.json();
              if (resolved.type === "product" || resolved.type === "category" || resolved.type === "blogPost") {
                resolvedTemplateType = resolved.type;
                if (resolved.type === "blogPost") resolvedTemplateType = "blog";
              }
            }
          }
        }

        if (!pageSlug && !resolvedTemplateType) return;

        const publicUrl = pageSlug
          ? `/api/pages/${encodeURIComponent(pageSlug)}`
          : `/api/templates/${resolvedTemplateType}`;
        const publicResponse = await fetch(publicUrl, { credentials: "include" });

        const publicData = publicResponse.ok ? await publicResponse.json() : null;
        let page = publicData;
        let nextResource: ContentResource | null = pageSlug
          ? null
          : resolvedTemplateType
            ? { kind: "template", type: resolvedTemplateType }
            : null;

        if (adminAuthenticated) {
          if (pageSlug) {
            if (pageSlug === "home") {
              const adminHomeResponse = await fetch("/api/admin/pages/home", { credentials: "include" });
              if (adminHomeResponse.ok) {
                page = await adminHomeResponse.json();
                nextResource = { kind: "page", slug: pageSlug, id: page.id };
              }
            } else {
              const adminPagesResponse = await fetch("/api/admin/pages", { credentials: "include" });
              if (adminPagesResponse.ok) {
                const adminPages = await adminPagesResponse.json();
                const adminPage = adminPages.find((item: any) => item.slug === pageSlug);
                if (adminPage) {
                  page = adminPage;
                  nextResource = { kind: "page", slug: pageSlug, id: adminPage.id };
                }
              }
            }
          } else if (resolvedTemplateType) {
            const adminTemplateResponse = await fetch(`/api/admin/templates/${resolvedTemplateType}`, { credentials: "include" });
            if (adminTemplateResponse.ok) {
              page = await adminTemplateResponse.json();
            }
          }
        }

        if (cancelled) return;
        setIsAdmin(adminAuthenticated);
        if (nextResource) setResource(nextResource);
        storedContentRef.current = page?.content ?? null;
        const document = parseInlineDocument(page?.content);

        const applyWhenReady = () => {
          if (cancelled || !rootRef.current) return;
           const root = rootRef.current;
           const contentRoot = contentRootForResource(root, nextResource);
           const elements = editableElements(contentRoot);
          if (!elements.length) return;
           applyOverrides(contentRoot, document.overrides);
           elementsRef.current = editableElements(contentRoot);
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
  }, [adminAuthenticated, pageSlug, pathname]);

  useEffect(() => {
    if (!isEditing) return;
    const root = rootRef.current;
    if (!root) return;

    const contentRoot = contentRootForResource(root, resource);
    const elements = editableElements(contentRoot);
    elementsRef.current = elements;
    originalValuesRef.current = new Map(
      elements.map((element) => {
        const path = elementPath(element, contentRoot);
        element.dataset.inlineOverridePath = path;
        return [path, element.outerHTML];
      }),
    );
    setEditingState(elements, true);
    refreshToolbarState();

    const preventNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a,button")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const preventLineBreaks = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && !(event.target as HTMLElement).closest("li")) {
        event.preventDefault();
      }
    };
    root.addEventListener("click", preventNavigation, true);
    root.addEventListener("keydown", preventLineBreaks, true);
    root.addEventListener("keyup", refreshToolbarState, true);
    root.addEventListener("mouseup", refreshToolbarState, true);

    return () => {
      root.removeEventListener("click", preventNavigation, true);
      root.removeEventListener("keydown", preventLineBreaks, true);
      root.removeEventListener("keyup", refreshToolbarState, true);
      root.removeEventListener("mouseup", refreshToolbarState, true);
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
      const contentRoot = contentRootForResource(root, resource);
      originalValuesRef.current.forEach((outerHtml, path) => {
        const element = contentRoot.querySelector<HTMLElement>(path);
        if (element) {
          element.outerHTML = outerHtml;
        }
      });
    }
    const refreshedElements = root
      ? editableElements(contentRootForResource(root, resource))
      : elementsRef.current;
    elementsRef.current = refreshedElements;
    setEditingState(refreshedElements, false);
    setIsEditing(false);
    setError("");
  };

  const saveEditing = async () => {
    const root = rootRef.current;
    if (!root || !resource) {
      setError("This content is not connected to a saved record yet.");
      return;
    }

    const contentRoot = contentRootForResource(root, resource);
    const overrides: Record<string, string> = {};
    elementsRef.current.forEach((element) => {
      overrides[stableElementPath(element, contentRoot)] = serializeOverride(element);
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
      const saveUrl = resource.kind === "page"
        ? `/api/admin/pages/${resource.id}`
        : `/api/admin/templates/${resource.type}`;
      const response = await fetch(saveUrl, {
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
      {isAdmin && resource && (
        <div
          data-inline-editor-ui
          className="fixed right-4 top-4 z-[100] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur"
        >
          {isEditing ? (
            <>
              <div className="flex max-w-full flex-wrap items-center gap-1">
                <select
                  value={/^h[1-6]$/.test(activeBlock) ? activeBlock : "p"}
                  onChange={(event) => runCommand("formatBlock", event.target.value)}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
                  aria-label="Text style"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                  <option value="h5">Heading 5</option>
                  <option value="h6">Heading 6</option>
                </select>
                <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
                <button type="button" title="Bold" onMouseDown={(event) => { event.preventDefault(); runCommand("bold"); }} className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${activeMarks.bold ? "bg-[#1a2f5a] text-white" : "text-slate-700 hover:bg-slate-100"}`} aria-label="Bold" aria-pressed={activeMarks.bold}><Bold className="h-4 w-4" /></button>
                <button type="button" title="Italic" onMouseDown={(event) => { event.preventDefault(); runCommand("italic"); }} className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${activeMarks.italic ? "bg-[#1a2f5a] text-white" : "text-slate-700 hover:bg-slate-100"}`} aria-label="Italic" aria-pressed={activeMarks.italic}><Italic className="h-4 w-4" /></button>
                <button type="button" title="Underline" onMouseDown={(event) => { event.preventDefault(); runCommand("underline"); }} className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${activeMarks.underline ? "bg-[#1a2f5a] text-white" : "text-slate-700 hover:bg-slate-100"}`} aria-label="Underline" aria-pressed={activeMarks.underline}><Underline className="h-4 w-4" /></button>
                <button type="button" title="Strikethrough" onMouseDown={(event) => { event.preventDefault(); runCommand("strikeThrough"); }} className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${activeMarks.strikeThrough ? "bg-[#1a2f5a] text-white" : "text-slate-700 hover:bg-slate-100"}`} aria-label="Strikethrough" aria-pressed={activeMarks.strikeThrough}><Strikethrough className="h-4 w-4" /></button>
                <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
                <button type="button" title="Bulleted list" onMouseDown={(event) => { event.preventDefault(); runCommand("insertUnorderedList"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Bulleted list"><List className="h-4 w-4" /></button>
                <button type="button" title="Numbered list" onMouseDown={(event) => { event.preventDefault(); runCommand("insertOrderedList"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Numbered list"><ListOrdered className="h-4 w-4" /></button>
                <button type="button" title="Blockquote" onMouseDown={(event) => { event.preventDefault(); runCommand("formatBlock", "blockquote"); }} className="inline-flex h-8 items-center justify-center rounded-md px-2 text-xs font-bold text-slate-700 hover:bg-slate-100" aria-label="Blockquote">“</button>
                <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
                <button type="button" title="Add link" onMouseDown={(event) => { event.preventDefault(); insertLink(); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Add link"><Link2 className="h-4 w-4" /></button>
                <button type="button" title="Remove link" onMouseDown={(event) => { event.preventDefault(); runCommand("unlink"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Remove link"><Unlink className="h-4 w-4" /></button>
                <button type="button" title="Align left" onMouseDown={(event) => { event.preventDefault(); runCommand("justifyLeft"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Align left"><AlignLeft className="h-4 w-4" /></button>
                <button type="button" title="Align center" onMouseDown={(event) => { event.preventDefault(); runCommand("justifyCenter"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Align center"><AlignCenter className="h-4 w-4" /></button>
                <button type="button" title="Align right" onMouseDown={(event) => { event.preventDefault(); runCommand("justifyRight"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Align right"><AlignRight className="h-4 w-4" /></button>
                <span className="mx-1 h-6 w-px bg-slate-200" aria-hidden="true" />
                <button type="button" title="Undo" onMouseDown={(event) => { event.preventDefault(); runCommand("undo"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Undo"><Undo2 className="h-4 w-4" /></button>
                <button type="button" title="Redo" onMouseDown={(event) => { event.preventDefault(); runCommand("redo"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Redo"><Redo2 className="h-4 w-4" /></button>
                <button type="button" title="Clear formatting" onMouseDown={(event) => { event.preventDefault(); runCommand("removeFormat"); }} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100" aria-label="Clear formatting"><Eraser className="h-4 w-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2">
                {error && <span className="mr-auto max-w-60 text-xs font-medium text-red-600">{error}</span>}
                <button type="button" onClick={cancelEditing} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><X className="h-4 w-4" /> Cancel</button>
                <button type="button" onClick={() => void saveEditing()} disabled={isSaving} className="inline-flex items-center gap-1.5 rounded-lg bg-[#e63329] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c42a21] disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isSaving ? "Submitting..." : resource.kind === "template" ? "Submit Template" : resource.slug === "home" ? "Submit Home Page" : "Submit Page"}
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2f5a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0d1f3c]"
            >
              <Pencil className="h-4 w-4" />{" "}
              {resource.kind === "template"
                ? `Edit ${templateLabel(resource.type)} Template`
                : resource.slug === "home"
                  ? "Edit Home Page"
                  : "Edit Page"}
            </button>
          )}
           {saved && !isEditing && <span className="text-xs font-medium text-emerald-600">Submitted for approval</span>}
           {!isEditing && <span className="hidden text-[11px] text-slate-500 xl:inline">Changes go live after Super Admin approval</span>}
           {error && <span className="max-w-52 text-xs font-medium text-red-600">{error}</span>}
        </div>
      )}
    </>
  );
}