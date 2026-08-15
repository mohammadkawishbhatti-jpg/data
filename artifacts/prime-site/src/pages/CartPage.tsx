import { useSEO } from "../lib/useSEO";
import { Link } from "wouter";

export default function CartPage() {
  useSEO({ title: "Get a Quote | Prime Packaging Boxes", description: "All orders at Prime Packaging Boxes are processed through our custom quote system for personalized pricing.", canonical: "/cart" });
  return (
    <>
      <div className="bg-[#1a2f5a] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Your Cart</h1>
          <p className="text-blue-100">All orders are handled through our personalized quote system</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#1a2f5a]/8 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a2f5a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#1a2f5a] mb-4">We Don't Have a Traditional Shopping Cart</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">Because every order is custom-manufactured to your exact specifications, we provide personalized pricing through our quote system. It's fast, free, and you'll receive a tailored quote within hours.</p>
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {[
            {
              color: "#e63329",
              title: "Custom Pricing",
              desc: "Every quote is tailored to your specific dimensions, material, finish, and quantity.",
              svg: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
            },
            {
              color: "#f59e0b",
              title: "Fast Response",
              desc: "Get your detailed quote within 2-4 hours during business hours.",
              svg: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
            },
            {
              color: "#10b981",
              title: "Personal Service",
              desc: "A dedicated packaging expert reviews every quote and handles your order.",
              svg: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
            },
          ].map(c => (
            <div key={c.title} className="border border-gray-100 rounded-2xl p-5 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: c.color + "15" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  {c.svg}
                </svg>
              </div>
              <h3 className="font-bold text-[#1a2f5a] mb-1">{c.title}</h3>
              <p className="text-sm text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
        <Link href="/get-a-quote" className="inline-block bg-[#e63329] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors">
          Get Your Free Quote →
        </Link>
        <p className="text-sm text-gray-500 mt-4">No commitment required. 100% free. Instant pricing within hours.</p>
      </div>
    </>
  );
}
