import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = "260px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  // Sync external value → DOM (only when changed externally, e.g. modal open)
  useEffect(() => {
    if (!editorRef.current || skipSync.current) return;
    if (editorRef.current.innerHTML !== (value ?? "")) {
      editorRef.current.innerHTML = value ?? "";
    }
  }, [value]);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    emit();
  };

  const emit = () => {
    skipSync.current = true;
    onChange(editorRef.current?.innerHTML ?? "");
    requestAnimationFrame(() => {
      skipSync.current = false;
    });
  };

  const tools: { label: string; title: string; run: () => void }[] = [
    { label: "B", title: "Bold (Ctrl+B)", run: () => exec("bold") },
    { label: "I", title: "Italic (Ctrl+I)", run: () => exec("italic") },
    { label: "U", title: "Underline (Ctrl+U)", run: () => exec("underline") },
    { label: "H2", title: "Heading 2", run: () => exec("formatBlock", "h2") },
    { label: "H3", title: "Heading 3", run: () => exec("formatBlock", "h3") },
    { label: "P", title: "Paragraph", run: () => exec("formatBlock", "p") },
    { label: "• List", title: "Bullet list", run: () => exec("insertUnorderedList") },
    { label: "1. List", title: "Numbered list", run: () => exec("insertOrderedList") },
    {
      label: "Link",
      title: "Insert hyperlink",
      run: () => {
        const url = prompt("Enter URL (e.g. https://example.com):");
        if (url) exec("createLink", url);
      },
    },
    { label: "Unlink", title: "Remove link", run: () => exec("unlink") },
    { label: "Clear", title: "Remove all formatting", run: () => exec("removeFormat") },
  ];

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/40 border-b sticky top-0 z-10">
        {tools.map((t, i) => (
          <button
            key={i}
            type="button"
            title={t.title}
            onMouseDown={(e) => {
              e.preventDefault();
              t.run();
            }}
            className="px-2 h-6 rounded text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground hover:shadow border border-transparent hover:border-border transition-all"
          >
            {t.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground self-center pr-1 hidden sm:block">
          Ctrl+B Bold · Ctrl+I Italic
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onPaste={() => setTimeout(emit, 0)}
        style={{ minHeight, outline: "none" }}
        className="px-4 py-3 text-sm leading-relaxed focus:outline-none
          [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-3 [&_h2]:mb-1
          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-2 [&_h3]:mb-0.5
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1
          [&_li]:my-0.5 [&_p]:my-1 [&_a]:text-blue-600 [&_a]:underline
          [&_hr]:border-border [&_hr]:my-3
          [&_strong]:font-bold [&_em]:italic [&_u]:underline"
        data-ph={placeholder}
      />

      <style>{`
        [data-ph]:empty:before {
          content: attr(data-ph);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
