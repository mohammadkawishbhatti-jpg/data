import { useEffect, useRef, useState, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Clean literal string "\n" or "\r\n" artifacts from database exports
const BS_N = String.fromCharCode(92) + "n";
const BS_R = String.fromCharCode(92) + "r";

function cleanLiteralNewlines(text: string): string {
  if (!text) return "";
  return text
    .split(BS_R + BS_N).join("<br/>")
    .split(BS_N).join("<br/>")
    .split(BS_R).join("");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = "260px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  // Active formatting state for WordPress-style button highlighting
  const [activeFormat, setActiveFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    block: "p", // "h1", "h2", "h3", "h4", "p", "blockquote"
  });

  // Sync external value -> DOM with automatic newline cleanup
  useEffect(() => {
    if (!editorRef.current || skipSync.current) return;
    const cleanedValue = cleanLiteralNewlines(value ?? "");
    if (editorRef.current.innerHTML !== cleanedValue) {
      editorRef.current.innerHTML = cleanedValue;
    }
  }, [value]);

  // Check current cursor selection element & active styles (like WordPress toolbar)
  const updateActiveFormat = useCallback(() => {
    if (!editorRef.current) return;

    const isBold = document.queryCommandState("bold");
    const isItalic = document.queryCommandState("italic");
    const isUnderline = document.queryCommandState("underline");

    // Query current block tag under cursor
    let blockTag = "p";
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.getRangeAt(0).startContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as HTMLElement).tagName.toLowerCase();
          if (["h1", "h2", "h3", "h4", "p", "blockquote"].includes(tag)) {
            blockTag = tag;
            break;
          }
        }
        node = node.parentNode;
      }
    }

    setActiveFormat({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      block: blockTag,
    });
  }, []);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    emit();
    updateActiveFormat();
  };

  const emit = () => {
    skipSync.current = true;
    onChange(editorRef.current?.innerHTML ?? "");
    requestAnimationFrame(() => {
      skipSync.current = false;
    });
  };

  return (
    <div className="rich-text-editor border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm" style={{ backgroundColor: "#ffffff", color: "#172033", colorScheme: "light" }}>
      {/* WordPress-Style Active Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10 select-none">
        
        {/* Block Format Selector (H1, H2, H3, H4, Paragraph) */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-1 py-0.5 shadow-xs">
          <button
            type="button"
            title="Heading 1 (Main Title)"
            onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h1"); }}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              activeFormat.block === "h1" ? "bg-[#1a2f5a] text-white shadow-xs" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            H1
          </button>
          <button
            type="button"
            title="Heading 2 (Section Title)"
            onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h2"); }}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              activeFormat.block === "h2" ? "bg-[#1a2f5a] text-white shadow-xs" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            H2
          </button>
          <button
            type="button"
            title="Heading 3 (Sub Heading)"
            onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h3"); }}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              activeFormat.block === "h3" ? "bg-[#1a2f5a] text-white shadow-xs" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            H3
          </button>
          <button
            type="button"
            title="Heading 4 (Minor Heading)"
            onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h4"); }}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
              activeFormat.block === "h4" ? "bg-[#1a2f5a] text-white shadow-xs" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            H4
          </button>
          <button
            type="button"
            title="Paragraph (Normal Text)"
            onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "p"); }}
            className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
              activeFormat.block === "p" ? "bg-[#1a2f5a] text-white shadow-xs" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            P
          </button>
        </div>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        {/* Text Formatting Buttons */}
        <button
          type="button"
          title="Bold (Ctrl+B)"
          onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}
          className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
            activeFormat.bold ? "bg-[#1a2f5a] text-white border-[#1a2f5a]" : "border-transparent text-slate-600 hover:bg-white hover:text-slate-950"
          }`}
        >
          B
        </button>
        <button
          type="button"
          title="Italic (Ctrl+I)"
          onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}
          className={`px-2.5 py-1 text-xs font-bold italic rounded border transition-colors ${
            activeFormat.italic ? "bg-[#1a2f5a] text-white border-[#1a2f5a]" : "border-transparent text-slate-600 hover:bg-white hover:text-slate-950"
          }`}
        >
          I
        </button>
        <button
          type="button"
          title="Underline (Ctrl+U)"
          onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}
          className={`px-2.5 py-1 text-xs font-bold underline rounded border transition-colors ${
            activeFormat.underline ? "bg-[#1a2f5a] text-white border-[#1a2f5a]" : "border-transparent text-slate-600 hover:bg-white hover:text-slate-950"
          }`}
        >
          U
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

        {/* Lists & Links */}
        <button
          type="button"
          title="Bullet list"
          onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors"
        >
          • List
        </button>
        <button
          type="button"
          title="Numbered list"
          onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors"
        >
          1. List
        </button>
        <button
          type="button"
          title="Blockquote"
          onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "blockquote"); }}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${activeFormat.block === "blockquote" ? "bg-[#1a2f5a] text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"}`}
        >
          Quote
        </button>
        <button
          type="button"
          title="Insert hyperlink"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = prompt("Enter URL (e.g. https://example.com):");
            if (url) exec("createLink", url);
          }}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors"
        >
          Link
        </button>
        <button
          type="button"
          title="Remove link"
          onMouseDown={(e) => { e.preventDefault(); exec("unlink"); }}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors"
        >
          Unlink
        </button>
        <button type="button" title="Undo" onMouseDown={(e) => { e.preventDefault(); exec("undo"); }} className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors">Undo</button>
        <button type="button" title="Redo" onMouseDown={(e) => { e.preventDefault(); exec("redo"); }} className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-950 rounded transition-colors">Redo</button>
        <button
          type="button"
          title="Remove formatting"
          onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}
          className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 rounded transition-colors"
        >
          Clear
        </button>

        {/* Active Block Indicator Badge */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-rose-400 border border-slate-700">
            Active: {activeFormat.block.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { emit(); updateActiveFormat(); }}
        onKeyUp={updateActiveFormat}
        onMouseUp={updateActiveFormat}
        onPaste={() => setTimeout(() => { emit(); updateActiveFormat(); }, 0)}
        style={{ minHeight, outline: "none" }}
        className="px-5 py-4 text-sm leading-relaxed focus:outline-none text-slate-900
          [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-950 [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:tracking-tight
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-950 [&_h2]:mt-3.5 [&_h2]:mb-1.5 [&_h2]:tracking-tight
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-950 [&_h3]:mt-3 [&_h3]:mb-1
          [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-slate-950 [&_h4]:mt-2 [&_h4]:mb-1
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1
          [&_li]:my-0.5 [&_p]:my-2 [&_p]:leading-relaxed
          [&_a]:text-[#1d4ed8] [&_a]:underline
          [&_blockquote]:border-l-4 [&_blockquote]:border-[#1a2f5a] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600
          [&_hr]:border-slate-300 [&_hr]:my-4
          [&_strong]:font-bold [&_em]:italic [&_u]:underline"
        data-ph={placeholder}
      />

      <style>{`
        [data-ph]:empty:before {
          content: attr(data-ph);
           color: #64748b;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
