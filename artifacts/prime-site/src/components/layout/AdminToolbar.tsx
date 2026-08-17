import { useState } from "react";
import { ArrowUpRight, ShieldCheck, X } from "lucide-react";

type AdminUser = { username?: string; role?: string };

export function AdminToolbar({ admin }: { admin: AdminUser }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative z-[70] border-b border-[#2b4770] bg-[#0d1f3c] text-white shadow-[0_2px_12px_rgba(13,31,60,0.2)]">
      <div className="mx-auto flex min-h-10 max-w-[1440px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#e63329]"><ShieldCheck className="h-3.5 w-3.5" /></span>
          <span className="truncate text-white/80">
            Admin mode <span className="hidden text-white/45 sm:inline">· Signed in as </span><strong className="text-white">{admin.username || "admin"}</strong>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href="/admin/" className="inline-flex items-center gap-1.5 rounded-md bg-[#e63329] px-3 py-1.5 text-[11px] font-extrabold text-white transition-colors hover:bg-[#c42a21]">
            Open Admin Panel <ArrowUpRight className="h-3 w-3" />
          </a>
          <button type="button" onClick={() => setDismissed(true)} className="rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Dismiss admin toolbar">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}