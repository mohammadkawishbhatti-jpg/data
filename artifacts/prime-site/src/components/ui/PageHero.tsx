import { Link } from "wouter";
import { ArrowRight, Phone } from "lucide-react";

interface Breadcrumb { label: string; href?: string; }
interface Cta { label: string; href: string; variant?: "primary" | "outline" | "phone"; }

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  bgImage: string;        // full URL — compressed Unsplash / own uploads
  breadcrumbs?: Breadcrumb[];
  ctas?: Cta[];
  minHeight?: number;     // px, default 340
  overlay?: "dark" | "medium";  // default dark
  align?: "left" | "center";    // default center
  bottomWave?: boolean;         // white wave at bottom
}

export function PageHero({
  title, subtitle, badge, bgImage, breadcrumbs, ctas,
  minHeight = 360, overlay = "dark", align = "center", bottomWave = true,
}: PageHeroProps) {
  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{ minHeight, background: "#0d1f3c" }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          width={1600}
          height={900}
          className="w-full h-full object-cover"
          style={{ opacity: overlay === "dark" ? 0.18 : 0.28 }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: overlay === "dark"
              ? "linear-gradient(135deg,#0d1f3c 0%,rgba(13,31,60,0.88) 50%,rgba(13,31,60,0.70) 100%)"
              : "linear-gradient(135deg,#0d1f3c 0%,rgba(13,31,60,0.75) 60%,rgba(13,31,60,0.55) 100%)",
          }}
        />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className={`container mx-auto px-4 py-16 relative z-10 ${align === "center" ? "text-center" : ""}`}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-white/40 text-xs mb-5 flex-wrap" style={align === "center" ? { justifyContent: "center" } : {}}>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {b.href
                  ? <Link href={b.href} className="hover:text-white/80 transition-colors">{b.label}</Link>
                  : <span className="text-white/70">{b.label}</span>}
                {i < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}

        {/* Badge */}
        {badge && (
          <span className="inline-flex items-center gap-1.5 bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            {badge}
          </span>
        )}

        {/* Title */}
        <h1
          className="font-extrabold text-white leading-tight mb-4"
          style={{ fontSize: "clamp(2rem,5vw,3.25rem)", maxWidth: align === "center" ? 800 : 720, margin: align === "center" ? "0 auto 16px" : "0 0 16px" }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-white/65 leading-relaxed mb-7"
            style={{ fontSize: "clamp(0.95rem,2vw,1.125rem)", maxWidth: align === "center" ? 640 : 580, margin: align === "center" ? "0 auto 28px" : "0 0 28px" }}
          >
            {subtitle}
          </p>
        )}

        {/* CTAs */}
        {ctas && ctas.length > 0 && (
          <div className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
            {ctas.map((c, i) =>
              c.variant === "phone" ? (
                <a key={i} href={c.href}
                  className="inline-flex items-center gap-2 border border-white/25 text-white hover:bg-white/10 px-5 py-2.5 rounded-lg font-bold text-sm transition-all">
                  <Phone className="w-4 h-4" />{c.label}
                </a>
              ) : c.variant === "outline" ? (
                <Link key={i} href={c.href}
                  className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 px-5 py-2.5 rounded-lg font-bold text-sm transition-all">
                  {c.label}
                </Link>
              ) : (
                <Link key={i} href={c.href}
                  className="inline-flex items-center gap-2 bg-[#e63329] hover:bg-[#c42a21] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg">
                  {c.label} <ArrowRight className="w-4 h-4" />
                </Link>
              )
            )}
          </div>
        )}
      </div>

      {/* Wave */}
      {bottomWave && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 36" fill="none" className="w-full block">
            <path d="M0 36 C480 0 960 0 1440 36 L1440 36 L0 36Z" fill="white" />
          </svg>
        </div>
      )}
    </section>
  );
}
