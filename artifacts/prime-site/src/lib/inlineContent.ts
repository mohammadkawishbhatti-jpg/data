import DOMPurify from "dompurify";

export const INLINE_DOCUMENT_MARKER = "__prime_inline_page_v1";
const INLINE_OVERRIDE_MARKER = "__prime_inline_override_v1";
const INLINE_TAG_PATTERN = /^(h[1-6]|p|div|span|li|a|button|label|small|dt|dd|th|td|ul|ol|blockquote)$/i;

export type InlineDocument = {
  baseContent: string;
  overrides: Record<string, string>;
};

export function parseInlineDocument(content: unknown): InlineDocument {
  if (typeof content !== "string") {
    return { baseContent: content == null ? "" : String(content), overrides: {} };
  }
  try {
    const parsed = JSON.parse(content);
    if (
      parsed?.[INLINE_DOCUMENT_MARKER] === true &&
      typeof parsed.baseContent === "string" &&
      parsed.overrides &&
      typeof parsed.overrides === "object"
    ) {
      return { baseContent: parsed.baseContent, overrides: parsed.overrides as Record<string, string> };
    }
  } catch {
    // Normal HTML or template JSON is not an inline document.
  }
  return { baseContent: content, overrides: {} };
}

export function sanitizeInlineHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      "a", "b", "blockquote", "br", "em", "h1", "h2", "h3", "h4", "h5",
      "h6", "i", "li", "mark", "ol", "p", "s", "strong", "u", "ul",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "title"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick", "onmouseover", "javascript"],
  });
}

export function parseInlineOverride(raw: string, fallbackTag: string): { tag: string; html: string } {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed?.[INLINE_OVERRIDE_MARKER] === true &&
      typeof parsed.html === "string"
    ) {
      return {
        tag: typeof parsed.tag === "string" && INLINE_TAG_PATTERN.test(parsed.tag)
          ? parsed.tag.toLowerCase()
          : fallbackTag,
        html: sanitizeInlineHtml(parsed.html),
      };
    }
  } catch {
    // Older inline revisions stored plain text.
  }
  return { tag: fallbackTag, html: sanitizeInlineHtml(raw) };
}

export function serializeInlineOverride(element: HTMLElement): string {
  return JSON.stringify({
    [INLINE_OVERRIDE_MARKER]: true,
    tag: element.tagName.toLowerCase(),
    html: sanitizeInlineHtml(element.innerHTML),
  });
}

export function applyInlineOverrides(root: HTMLElement, overrides: Record<string, string>): number {
  let applied = 0;
  Object.entries(overrides).forEach(([path, raw]) => {
    const element = root.querySelector<HTMLElement>(path);
    if (!element || element.closest("[data-inline-dynamic='true']")) return;
    const override = parseInlineOverride(raw, element.tagName.toLowerCase());
    if (override.tag !== element.tagName.toLowerCase()) {
      const replacement = document.createElement(override.tag);
      Array.from(element.attributes).forEach((attribute) => {
        if (attribute.name !== "contenteditable") {
          replacement.setAttribute(attribute.name, attribute.value);
        }
      });
      replacement.dataset.inlineOverridePath = path;
      replacement.innerHTML = override.html;
      element.replaceWith(replacement);
      applied += 1;
      return;
    }
    if (element.innerHTML !== override.html) element.innerHTML = override.html;
    element.dataset.inlineOverridePath = path;
    applied += 1;
  });
  return applied;
}
