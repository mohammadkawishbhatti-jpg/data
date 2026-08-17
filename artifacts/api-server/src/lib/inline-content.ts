const INLINE_DOCUMENT_MARKER = "__prime_inline_page_v1";
const INLINE_OVERRIDE_MARKER = "__prime_inline_override_v1";
const ALLOWED_TAGS = new Set([
  "a", "b", "blockquote", "br", "em", "h1", "h2", "h3", "h4", "h5",
  "h6", "i", "li", "mark", "ol", "p", "s", "strong", "u", "ul",
]);
const ALLOWED_CONTAINER_TAG = /^(h[1-6]|p|div|span|li|a|button|label|small|dt|dd|th|td|ul|ol|blockquote)$/i;
const SAFE_PATH = /^(?:[a-z][a-z0-9-]*:nth-of-type\(\d+\))(?: > [a-z][a-z0-9-]*:nth-of-type\(\d+\))*$/i;

function sanitizeInlineHtml(raw: string): string {
  let html = raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|svg)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");

  html = html.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    if (tag === "br") return "<br>";
    if (tag !== "a") return `<${tag}>`;

    const href = rawAttrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const target = rawAttrs.match(/\btarget\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const title = rawAttrs.match(/\btitle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const hrefValue = (href?.[1] ?? href?.[2] ?? href?.[3] ?? "").trim();
    const targetValue = (target?.[1] ?? target?.[2] ?? target?.[3] ?? "").trim();
    const titleValue = (title?.[1] ?? title?.[2] ?? title?.[3] ?? "").trim();
    const safeHref = /^(https?:|mailto:|tel:|\/|#)/i.test(hrefValue) ? hrefValue : "";
    const attrs = [
      safeHref ? ` href="${escapeAttribute(safeHref)}"` : "",
      targetValue === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : "",
      titleValue ? ` title="${escapeAttribute(titleValue)}"` : "",
    ].join("");
    return `<a${attrs}>`;
  });
  return html;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function sanitizeOverride(raw: unknown, fallbackTag: string): string {
  if (typeof raw !== "string") throw new Error("Inline override must be a string");
  let tag = fallbackTag;
  let html = raw;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.[INLINE_OVERRIDE_MARKER] === true) {
      if (typeof parsed.html !== "string") throw new Error("Inline override HTML is missing");
      html = parsed.html;
      if (typeof parsed.tag === "string" && ALLOWED_CONTAINER_TAG.test(parsed.tag)) {
        tag = parsed.tag.toLowerCase();
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Inline override")) throw error;
    // Older revisions stored plain text.
  }
  return JSON.stringify({
    [INLINE_OVERRIDE_MARKER]: true,
    tag,
    html: sanitizeInlineHtml(html),
  });
}

export function sanitizeInlineDocument(content: string): string {
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    return content;
  }
  if (
    parsed?.[INLINE_DOCUMENT_MARKER] !== true ||
    typeof parsed.baseContent !== "string" ||
    !parsed.overrides ||
    typeof parsed.overrides !== "object" ||
    Array.isArray(parsed.overrides)
  ) {
    return content;
  }

  const overrides: Record<string, string> = {};
  Object.entries(parsed.overrides).forEach(([path, raw]) => {
    if (!SAFE_PATH.test(path)) throw new Error("Inline override selector is invalid");
    const fallbackTag = path.split(" > ").at(-1)?.split(":")[0] || "p";
    overrides[path] = sanitizeOverride(raw, fallbackTag);
  });

  return JSON.stringify({
    [INLINE_DOCUMENT_MARKER]: true,
    baseContent: parsed.baseContent,
    overrides,
  });
}
