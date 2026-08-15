import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search, LayoutDashboard, Package, FolderOpen, ImageIcon,
  FileText, Mail, BookOpen, Settings, Users, HardDrive, Shield,
  Palette, ShoppingBag, Receipt, FileOutput, Upload, Bell, Bot,
  Inbox, ArrowRight, X, Sparkles
} from "lucide-react";

interface CommandItem {
  name: string;
  category: string;
  href: string;
  icon: any;
  shortcut?: string;
}

const commands: CommandItem[] = [
  { name: "Dashboard Overview", category: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Quote Pipeline Kanban", category: "Overview", href: "/quote-pipeline", icon: Sparkles },
  { name: "Follow-up Notifications", category: "Overview", href: "/follow-ups", icon: Bell },
  { name: "Products Catalog", category: "Commerce", href: "/products", icon: Package, shortcut: "G P" },
  { name: "Orders Management", category: "Commerce", href: "/orders", icon: ShoppingBag, shortcut: "G O" },
  { name: "Quotes & Requests", category: "Commerce", href: "/quotes", icon: FileText, shortcut: "G Q" },
  { name: "Lead Inquiries", category: "Commerce", href: "/leads", icon: Inbox, shortcut: "G L" },
  { name: "Custom Quote Builder", category: "Tools", href: "/quote-builder", icon: FileOutput },
  { name: "Invoice Builder & PDF", category: "Tools", href: "/invoice-builder", icon: Receipt },
  { name: "WordPress Product Import", category: "Tools", href: "/import-products", icon: Upload },
  { name: "Categories Manager", category: "Catalog", href: "/categories", icon: FolderOpen },
  { name: "Banners & Hero Media", category: "Catalog", href: "/banners", icon: ImageIcon },
  { name: "Pages & Landers", category: "Content", href: "/pages", icon: FileText },
  { name: "Blog Posts & Articles", category: "Content", href: "/blog", icon: BookOpen },
  { name: "Media Library", category: "Content", href: "/media", icon: HardDrive },
  { name: "Clark AI Assistant", category: "AI & System", href: "/clark", icon: Bot },
  { name: "System Settings", category: "Settings", href: "/settings", icon: Settings, shortcut: "G S" },
  { name: "Users & Security", category: "Settings", href: "/security", icon: Shield },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const filtered = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      setLocation(filtered[selectedIndex].href);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#0f172a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="h-5 w-5 text-rose-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. Products, Orders, Settings)..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.href + item.name}
                  onClick={() => {
                    setLocation(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-500/20 to-indigo-500/20 text-white border border-rose-500/30 pl-4"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" : "bg-slate-800 text-slate-400"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="h-4 w-4 text-rose-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">ESC</kbd> Close</span>
          </div>
          <span className="font-semibold text-rose-400">Prime Admin Palette</span>
        </div>
      </div>
    </div>
  );
}
