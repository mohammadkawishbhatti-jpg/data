import { useState, useRef, useEffect, useMemo, memo, type ElementType } from "react";
import { Link, useLocation } from "wouter";
import { useSettings } from "../../context/SettingsContext";
import { useGetMenu, type MenuItem } from "@workspace/api-client-react";
import {
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Package,
  Flame,
  Star,
  Palette,
  Truck,
  Zap,
  CheckCircle2,
  Leaf,
  Award,
  User,
  ExternalLink,
} from "lucide-react";

const BY_INDUSTRY = [
  { label: "Apparel Boxes", slug: "apparel-boxes" },
  { label: "Bakery Boxes", slug: "bakery-boxes" },
  { label: "Bottle Boxes", slug: "bottle-boxes" },
  { label: "Candle Boxes", slug: "candle-boxes" },
  { label: "CBD Boxes", slug: "cbd-boxes" },
  { label: "Cereal Boxes", slug: "cereal-boxes" },
  { label: "Coffee Packaging", slug: "coffee-packaging" },
  { label: "Display Boxes", slug: "display-boxes" },
  { label: "Food Boxes", slug: "food-boxes" },
  { label: "Mailer Boxes", slug: "mailer-boxes" },
  { label: "Medicine Boxes", slug: "medicine-boxes" },
  { label: "Retail Boxes", slug: "retail-boxes" },
  { label: "Shipping Boxes", slug: "shipping-boxes" },
  { label: "Soap Boxes", slug: "soap-boxes" },
  { label: "Gable Boxes", slug: "gable-boxes" },
  { label: "Product Boxes", slug: "product-boxes" },
];

const HOT_SELLING = [
  { label: "Christmas Boxes", slug: "christmas-boxes" },
  { label: "Custom Paper Bags", slug: "custom-paper-bags" },
  { label: "Jewelry Boxes", slug: "jewelry-boxes" },
  { label: "Pillow Boxes", slug: "pillow-boxes" },
  { label: "Pizza Boxes", slug: "pizza-boxes" },
  { label: "Tea Packaging", slug: "tea-packaging" },
  { label: "Trays & Sleeves", slug: "trays-and-sleeves" },
  { label: "Window Packaging", slug: "window-packaging" },
  { label: "Stationery Boxes", slug: "stationery-boxes" },
  { label: "Cigarette Boxes", slug: "cigarette-boxes" },
];

const BOX_BY_STYLE = [
  { label: "Cardboard Boxes", slug: "cardboard-boxes" },
  { label: "Corrugated Boxes", slug: "corrugated-boxes" },
  { label: "Custom Kraft Boxes", slug: "custom-kraft-boxes" },
  { label: "Eco-Friendly Boxes", slug: "eco-friendly-boxes" },
  { label: "Cosmetic Boxes", slug: "cosmetic-boxes" },
  { label: "Chocolate Boxes", slug: "chocolate-boxes" },
  { label: "Labels & Stickers", slug: "labels-and-stickers" },
  { label: "Custom Mylar Bags", slug: "custom-mylar-bags" },
  { label: "Rigid Boxes", slug: "rigid-boxes" },
  { label: "Gift Boxes", slug: "gift-boxes" },
];

const FEATURED_IN_MENU = [
  { img: "/api/uploads/custom-cake-boxes.webp", label: "Cake Boxes", slug: "custom-cake-boxes" },
  { img: "/api/uploads/luxury-chocolate-boxes.webp", label: "Chocolate Boxes", slug: "luxury-chocolate-boxes" },
  { img: "/api/uploads/custom-kraft-boxes-wholesale.webp", label: "Kraft Boxes", slug: "custom-kraft-boxes" },
  { img: "/api/uploads/printed-magnetic-closure-boxes-bulk.webp", label: "Magnetic Boxes", slug: "custom-magnetic-closure-boxes" },
];

const TICKER: { Icon: ElementType; text: string }[] = [
  { Icon: Truck, text: "Free Shipping — USA & UK" },
  { Icon: Zap, text: "7–10 Day Turnaround" },
  { Icon: Palette, text: "Free Design Support" },
  { Icon: Package, text: "100 Unit Minimum" },
  { Icon: CheckCircle2, text: "100% Quality Guarantee" },
  { Icon: Leaf, text: "FSC Certified Materials" },
  { Icon: Award, text: "500+ Happy Brands" },
  { Icon: Star, text: "4.9 Star Rating" },
];

const LOGO_SRC = "/api/uploads/prime-packaging-logo-transparent.svg";

const DEFAULT_PRIMARY_MENU: MenuItem[] = [
  { id: "home", label: "Home", href: "/", parentId: null, group: null, order: 10, isVisible: true, openInNewTab: false },
  { id: "products", label: "Products", href: "/products", parentId: null, group: null, order: 20, isVisible: true, openInNewTab: false },
  { id: "faq", label: "FAQ", href: "/faq", parentId: null, group: null, order: 30, isVisible: true, openInNewTab: false },
  { id: "blog", label: "Blog", href: "/blog", parentId: null, group: null, order: 40, isVisible: true, openInNewTab: false },
  { id: "about", label: "About", href: "/about", parentId: null, group: null, order: 50, isVisible: true, openInNewTab: false },
  { id: "contact", label: "Contact", href: "/contact", parentId: null, group: null, order: 60, isVisible: true, openInNewTab: false },
];

type ProductMenuLink = { label: string; slug: string; href?: string };
type ProductMenuSection = { heading: string; items: ProductMenuLink[] };

function _Header() {
  const { phone, email, announcementBar } = useSettings();
  const { data: primaryMenu } = useGetMenu("primary");
  const telLink = `tel:${phone.replace(/\D/g, "")}`;
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileOpenIds, setMobileOpenIds] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMenu = primaryMenu?.isActive ? primaryMenu : undefined;
  const menuItems = useMemo(
    () => (activeMenu ? activeMenu.items : DEFAULT_PRIMARY_MENU).filter(item => item.isVisible && !item.parentId).sort((a, b) => a.order - b.order),
    [activeMenu],
  );
  const childrenFor = (parentId: string) => (activeMenu?.items ?? DEFAULT_PRIMARY_MENU)
    .filter(item => item.isVisible && item.parentId === parentId)
    .sort((a, b) => a.order - b.order);
  const dropOpen = openMenuId === "products";
  const productChildren = childrenFor("products");
  const productItemsFor = (group: string, fallback: ProductMenuLink[]): ProductMenuLink[] => {
    if (productChildren.length === 0) return fallback;
    return productChildren
      .filter(child => child.group === group || (group === "By industry" && !["Hot selling", "By style / material"].includes(child.group ?? "")))
      .map(child => ({ label: child.label, slug: child.id, href: child.href || `/${child.id}` }));
  };
  const productSections: ProductMenuSection[] = [
    { heading: "By industry", items: productItemsFor("By industry", BY_INDUSTRY) },
    { heading: "Hot selling", items: productItemsFor("Hot selling", HOT_SELLING) },
    { heading: "By style / material", items: productItemsFor("By style / material", BOX_BY_STYLE) },
  ];
  const configuredTicker = useMemo(() => {
    try {
      const parsed = JSON.parse(announcementBar || "");
      if (Array.isArray(parsed)) {
        const items = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
        if (items.length > 0) return items.map(text => ({ Icon: Package, text }));
      }
    } catch {
      // Legacy plain-text announcement values fall back to the full default ticker.
    }
    return TICKER;
  }, [announcementBar]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const openDrop = (menuId = "products") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenMenuId(menuId);
  };

  const closeDrop = () => {
    timerRef.current = setTimeout(() => setOpenMenuId(null), 120);
  };

  const closeAll = () => {
    setMobileOpen(false);
    setMobileOpenIds({});
    setOpenMenuId(null);
  };

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 font-sans">
      <div className="header-trust-rail bg-[#112b4b] text-white">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="header-ticker-track flex min-w-max items-center">
            {[...configuredTicker, ...configuredTicker].map(({ Icon, text }, index) => (
              <span key={`${text}-${index}`} className="inline-flex shrink-0 items-center gap-2 px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70 first:pl-0">
                <Icon className="h-3 w-3 shrink-0 text-[#f1b45a]" strokeWidth={1.8} />
                {text}
              </span>
            ))}
          </div>
          <div className="ml-auto hidden shrink-0 items-center gap-5 border-l border-white/15 bg-[#112b4b] pl-6 text-[10px] font-medium tracking-[0.04em] lg:flex">
            <a href={telLink} className="inline-flex items-center gap-1.5 text-white/75 transition-colors hover:text-white">
              <Phone className="h-3 w-3 text-[#f1b45a]" /> {phone}
            </a>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white">
              <Mail className="h-3 w-3 text-[#f1b45a]" /> {email}
            </a>
          </div>
        </div>
      </div>

      <div className={`relative border-b transition-all duration-300 ${scrolled ? "border-[#dce4eb]/80 bg-[#fbfcfd]/95 shadow-[0_10px_30px_rgba(17,43,75,0.09)] backdrop-blur-md" : "border-[#e5ebf0] bg-[#fbfcfd]"}`}>
        <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Link href="/" onClick={closeAll} className="group shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3483e] focus-visible:ring-offset-2">
            {logoFailed ? (
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e3483e] text-lg font-black text-white shadow-[0_5px_14px_rgba(227,72,62,0.24)]">P</div>
                <div className="leading-[1.08]">
                  <div className="text-[12px] font-extrabold tracking-[0.08em] text-[#183654]">PRIME PACKAGING</div>
                  <div className="text-[12px] font-extrabold tracking-[0.08em] text-[#183654]">BOXES</div>
                  <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.2em] text-[#768696]">Next Level Packaging</div>
                </div>
              </div>
            ) : (
              <img src={LOGO_SRC} alt="Prime Packaging Boxes" className="h-[48px] w-auto transition-transform duration-200 group-hover:scale-[1.02]" onError={() => setLogoFailed(true)} />
            )}
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">
            {menuItems.map(item => {
              const children = childrenFor(item.id);
              if (item.id === "products") {
                return (
                  <div key={item.id} onMouseEnter={() => openDrop(item.id)} onMouseLeave={closeDrop}>
                    <button
                      type="button"
                      aria-expanded={dropOpen}
                      aria-haspopup="true"
                      onClick={() => setOpenMenuId(current => current === item.id ? null : item.id)}
                      className={`nav-link-ul inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors ${dropOpen ? "bg-[#e3483e]/[0.07] text-[#d93c34]" : "text-[#30465c] hover:bg-[#edf2f5] hover:text-[#d93c34]"}`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropOpen ? "rotate-180 text-[#e3483e]" : "text-[#8291a0]"}`} />
                    </button>
                    {dropOpen && (
                      <div
                        className="absolute inset-x-4 top-full z-[9999] mx-auto mt-2 max-w-[1120px] overflow-hidden rounded-2xl border border-[#dfe7ed] bg-[#fbfcfd] shadow-[0_25px_70px_rgba(17,43,75,0.19)]"
                        onMouseEnter={() => openDrop(item.id)}
                        onMouseLeave={closeDrop}
                        style={{ animation: "megaFadeIn 180ms ease-out both" }}
                      >
                        <div className="flex items-center justify-between bg-[#112b4b] px-7 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e3483e] text-white"><Package className="h-3.5 w-3.5" /></span>
                            <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/90">Custom packaging, organized</span>
                          </div>
                          <Link href={item.href} onClick={closeAll} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f1b45a] transition-colors hover:text-white">
                            View all products <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr_1fr_272px]">
                          <MenuColumn
                            title="By industry"
                            tone="blue"
                            Icon={Package}
                            items={productItemsFor("By industry", BY_INDUSTRY)}
                            onSelect={closeAll}
                          />
                          <MenuColumn
                            title="Hot selling"
                            tone="orange"
                            Icon={Flame}
                            items={productItemsFor("Hot selling", HOT_SELLING)}
                            onSelect={closeAll}
                          />
                          <MenuColumn
                            title="By style / material"
                            tone="purple"
                            Icon={Palette}
                            items={productItemsFor("By style / material", BOX_BY_STYLE)}
                            onSelect={closeAll}
                          />
                          <FeaturedColumn onSelect={closeAll} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (children.length > 0) {
                return <SimpleDesktopDropdown key={item.id} item={item} children={children} open={openMenuId === item.id} onOpen={() => openDrop(item.id)} onClose={closeDrop} onSelect={closeAll} active={isActive(item.href)} />;
              }
              return <NavLink key={item.id} href={item.href} label={item.label} active={isActive(item.href)} onClick={closeAll} target={item.openInNewTab ? "_blank" : undefined} />;
            })}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-2.5 lg:flex">
            <a href="/customer-portal/" className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9e3eb] bg-white px-3 py-2 text-[11px] font-bold text-[#24415d] transition-colors hover:border-[#b9cbd8] hover:bg-[#f2f6f8] hover:text-[#d93c34]">
              <User className="h-3.5 w-3.5" /> Portal
            </a>
            <Link href="/request-sample" onClick={closeAll} className="px-2 py-2 text-[11px] font-bold text-[#637487] transition-colors hover:text-[#d93c34]">Free samples</Link>
            <Link href="/get-a-quote" onClick={closeAll} className="btn-shimmer inline-flex items-center gap-2 rounded-lg bg-[#e3483e] px-4 py-2.5 text-[12px] font-extrabold text-white shadow-[0_6px_16px_rgba(227,72,62,0.2)] transition-all hover:bg-[#cf3932] hover:shadow-[0_8px_20px_rgba(227,72,62,0.27)]">
              Get a quote <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button type="button" className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[#dce5eb] text-[#183654] transition-colors hover:bg-[#eef3f6] lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-[60] h-[calc(100dvh-106px)] lg:hidden">
          <button type="button" className="absolute inset-0 bg-[#112b4b]/35 backdrop-blur-[2px]" onClick={closeAll} aria-label="Close navigation" />
          <aside className="absolute bottom-0 right-0 top-0 flex w-[min(410px,100%)] flex-col overflow-y-auto border-l border-[#dce5eb] bg-[#fbfcfd] shadow-[-20px_0_60px_rgba(17,43,75,0.18)]" style={{ animation: "drawerIn 220ms ease-out both" }}>
            <div className="flex items-center justify-between border-b border-[#e5ebf0] px-5 py-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e3483e]">Prime Packaging Boxes</div>
                <div className="mt-1 text-sm font-semibold text-[#183654]">What are you building?</div>
              </div>
              <button type="button" onClick={closeAll} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dce5eb] text-[#637487] hover:bg-[#eef3f6]" aria-label="Close menu"><X className="h-4 w-4" /></button>
            </div>
            <nav className="divide-y divide-[#e7edf1]" aria-label="Mobile navigation">
              {menuItems.map(item => {
                const children = childrenFor(item.id);
                const isOpen = !!mobileOpenIds[item.id];
                if (item.id === "products") {
                  return (
                    <div key={item.id}>
                      <button type="button" onClick={() => setMobileOpenIds(current => ({ ...current, [item.id]: !isOpen }))} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-[#243f59] hover:text-[#d93c34]">
                        {item.label} <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#e3483e]" : "text-[#8393a2]"}`} />
                      </button>
                      {isOpen && (
                        <div className="space-y-5 bg-[#f1f5f7] px-5 pb-5 pt-1">
                          {productSections.map((section) => (
                            <div key={section.heading}>
                              <div className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7b8a99]">{section.heading}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {section.items.map((entry) => <Link key={entry.slug} href={entry.href ?? `/${entry.slug}`} target={entry.href?.startsWith("http") ? "_blank" : undefined} rel={entry.href?.startsWith("http") ? "noreferrer" : undefined} onClick={closeAll} className="text-[13px] font-medium text-[#4d6377] transition-colors hover:text-[#d93c34]">{entry.label}</Link>)}
                              </div>
                            </div>
                          ))}
                          <Link href={item.href} onClick={closeAll} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#e3483e]">View all products <ArrowRight className="h-3.5 w-3.5" /></Link>
                        </div>
                      )}
                    </div>
                  );
                }
                if (children.length > 0) {
                  return (
                    <div key={item.id}>
                      <button type="button" onClick={() => setMobileOpenIds(current => ({ ...current, [item.id]: !isOpen }))} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-[#243f59] hover:text-[#d93c34]">
                        {item.label} <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#e3483e]" : "text-[#8393a2]"}`} />
                      </button>
                      {isOpen && <div className="space-y-1 bg-[#f1f5f7] px-5 pb-4 pt-1">{children.map(child => <Link key={child.id} href={child.href} target={child.openInNewTab ? "_blank" : undefined} rel={child.openInNewTab ? "noreferrer" : undefined} onClick={closeAll} className="flex items-center justify-between py-2 text-[13px] font-medium text-[#4d6377] hover:text-[#d93c34]">{child.label}<ArrowRight className="h-3 w-3 text-[#b1bdc7]" /></Link>)}</div>}
                    </div>
                  );
                }
                return <MobileLink key={item.id} href={item.href} label={item.label} onClick={closeAll} target={item.openInNewTab ? "_blank" : undefined} />;
              })}
              <MobileLink href="/request-sample" label="Free samples" onClick={closeAll} />
              <a href="/customer-portal/" onClick={closeAll} className="flex items-center gap-2 px-5 py-4 text-sm font-bold text-[#244f78] hover:text-[#d93c34]"><User className="h-4 w-4" /> Customer portal</a>
            </nav>
            <div className="mt-auto space-y-2.5 border-t border-[#dce5eb] bg-[#eef3f5] p-5">
              <a href={telLink} className="flex items-center justify-center gap-2 rounded-lg border border-[#b9cbd8] bg-[#fbfcfd] px-4 py-3 text-sm font-bold text-[#183654] transition-colors hover:border-[#183654]"><Phone className="h-4 w-4" /> {phone}</a>
              <a href={`mailto:${email}`} className="flex items-center justify-center gap-2 px-2 py-1 text-xs font-semibold text-[#637487] hover:text-[#d93c34]"><Mail className="h-3.5 w-3.5" /> {email}</a>
              <Link href="/get-a-quote" onClick={closeAll} className="btn-shimmer flex items-center justify-center gap-2 rounded-lg bg-[#e3483e] px-4 py-3 text-sm font-extrabold text-white shadow-[0_7px_18px_rgba(227,72,62,0.22)]">Get a free quote <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes megaFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes drawerIn { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        .header-ticker-track { animation: headerTicker 34s linear infinite; }
        @keyframes headerTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .header-ticker-track { animation: none; } }
      `}</style>
    </header>
  );
}

function NavLink({ href, label, active, onClick, target }: { href: string; label: string; active: boolean; onClick: () => void; target?: string }) {
  return <Link href={href} target={target} rel={target ? "noreferrer" : undefined} onClick={onClick} className={`nav-link-ul rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors ${active ? "bg-[#e3483e]/[0.07] text-[#d93c34]" : "text-[#30465c] hover:bg-[#edf2f5] hover:text-[#d93c34]"}`}>{label}</Link>;
}

function MobileLink({ href, label, onClick, target }: { href: string; label: string; onClick: () => void; target?: string }) {
  return <Link href={href} target={target} rel={target ? "noreferrer" : undefined} onClick={onClick} className="flex items-center justify-between px-5 py-4 text-sm font-bold text-[#243f59] transition-colors hover:text-[#d93c34]">{label}<ArrowRight className="h-3.5 w-3.5 text-[#b1bdc7]" /></Link>;
}

function SimpleDesktopDropdown({
  item,
  children,
  open,
  active,
  onOpen,
  onClose,
  onSelect,
}: {
  item: MenuItem;
  children: MenuItem[];
  open: boolean;
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: () => void;
}) {
  return (
    <div onMouseEnter={onOpen} onMouseLeave={onClose} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onOpen}
        className={`nav-link-ul inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors ${open || active ? "bg-[#e3483e]/[0.07] text-[#d93c34]" : "text-[#30465c] hover:bg-[#edf2f5] hover:text-[#d93c34]"}`}
      >
        {item.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180 text-[#e3483e]" : "text-[#8291a0]"}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-[9999] mt-2 min-w-[230px] -translate-x-1/2 overflow-hidden rounded-xl border border-[#dfe7ed] bg-[#fbfcfd] p-2 shadow-[0_20px_50px_rgba(17,43,75,0.18)]" style={{ animation: "megaFadeIn 180ms ease-out both" }}>
          {children.map(child => (
            <Link key={child.id} href={child.href} target={child.openInNewTab ? "_blank" : undefined} rel={child.openInNewTab ? "noreferrer" : undefined} onClick={onSelect} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold text-[#52677a] transition-colors hover:bg-[#fff0ee] hover:text-[#d93c34]">
              {child.label}
              {child.openInNewTab && <ExternalLink className="h-3 w-3" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuColumn({ title, tone, Icon, items, onSelect }: { title: string; tone: "blue" | "orange" | "purple"; Icon: ElementType; items: { label: string; slug: string; href?: string }[]; onSelect: () => void }) {
  const toneStyles = {
    blue: { icon: "bg-[#eaf3fb] text-[#3377a9]", line: "border-[#dcebf5]", label: "text-[#3377a9]" },
    orange: { icon: "bg-[#fff1e6] text-[#d66a1c]", line: "border-[#fae3d2]", label: "text-[#d66a1c]" },
    purple: { icon: "bg-[#f2edfa] text-[#7653a5]", line: "border-[#e7ddf4]", label: "text-[#7653a5]" },
  }[tone];
  return (
    <div className="border-r border-[#e6edf1] px-5 py-5">
      <div className={`mb-3.5 flex items-center gap-2 border-b-2 pb-2.5 ${toneStyles.line}`}>
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${toneStyles.icon}`}><Icon className="h-3.5 w-3.5" /></span>
        <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${toneStyles.label}`}>{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {items.map((item) => <Link key={item.slug} href={item.href ?? `/${item.slug}`} onClick={onSelect} className="truncate rounded-md px-2 py-1.5 text-[12px] font-medium text-[#52677a] transition-colors hover:bg-[#fff0ee] hover:text-[#d93c34]">{item.label}</Link>)}
      </div>
    </div>
  );
}

function FeaturedColumn({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="bg-[#f2f5f6] px-4 py-5">
      <div className="mb-3.5 flex items-center gap-2 border-b-2 border-[#f4e9c8] pb-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fff6d9] text-[#be8c13]"><Star className="h-3.5 w-3.5" fill="currentColor" /></span>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#a2740c]">Featured</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {FEATURED_IN_MENU.map((item) => (
          <Link key={item.slug} href={`/${item.slug}`} onClick={onSelect} className="group overflow-hidden rounded-lg border border-[#dce4e8] bg-[#fbfcfd] transition-all hover:-translate-y-0.5 hover:border-[#e3483e]/40 hover:shadow-[0_5px_14px_rgba(17,43,75,0.1)]">
            <div className="aspect-[4/3] overflow-hidden bg-[#e7edf0]"><img src={item.img} alt={item.label} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(event) => { event.currentTarget.style.opacity = "0.25"; }} /></div>
            <div className="px-2 py-1.5 text-[10px] font-bold text-[#40566a]">{item.label}</div>
          </Link>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-[#d6e0e6]">
        <div className="flex items-start gap-2.5 bg-[#183654] px-3 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#e3483e] text-white"><Palette className="h-3 w-3" /></span>
          <div><div className="text-[11px] font-bold text-white">Free design support</div><div className="mt-0.5 text-[9px] leading-[1.4] text-white/60">In-house designers. Unlimited revisions.</div></div>
        </div>
        <Link href="/get-a-quote" onClick={onSelect} className="flex items-center justify-center gap-1.5 bg-[#e3483e] py-2 text-[10px] font-extrabold text-white transition-colors hover:bg-[#cf3932]">Get a free quote <ArrowRight className="h-3 w-3" /></Link>
      </div>
    </div>
  );
}

export const Header = memo(_Header);