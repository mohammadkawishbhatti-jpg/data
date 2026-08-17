import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Mail, Plus, Printer, Search, Save, Trash2 } from "lucide-react";

const API = "/api";
const NAVY = "#1a2f5a";
const LOGO_URL = "/api/uploads/prime-packaging-logo.svg";
const CURRENCIES: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", PKR: "₨", AED: "د.إ" };

type Item = {
  name: string;
  description: string;
  material: string;
  finish: string;
  printing: string;
  size: string;
  qty: number;
  unitPrice: number;
  discount: number;
};

const newItem = (): Item => ({
  name: "",
  description: "",
  material: "",
  finish: "",
  printing: "",
  size: "",
  qty: 500,
  unitPrice: 0,
  discount: 0,
});

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const displayDate = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const money = (value: number, symbol: string) => `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="mb-3 overflow-hidden rounded-xl border border-gray-100">
      <button type="button" onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between bg-gray-50 px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 hover:bg-gray-100">
        {title}
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="space-y-3 p-4">{children}</div>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}{children}</label>;
}

const inputClass = "w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-[13px] font-normal normal-case tracking-normal text-gray-800 outline-none focus:border-[#1a2f5a] focus:ring-2 focus:ring-[#1a2f5a]/10";

export default function InvoiceBuilderPage() {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-001`);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(plusDays(30));
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCountry, setCustomerCountry] = useState("United States");
  const [execName, setExecName] = useState("");
  const [execEmail, setExecEmail] = useState("help@primepackagingboxes.com");
  const [execPhone, setExecPhone] = useState("818-758-4076");
  const [projectNotes, setProjectNotes] = useState("Thank you for your business. Please find below your invoice for custom packaging services.");
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [footerNotes, setFooterNotes] = useState("Payment due within 30 days. Late payments subject to 1.5% monthly interest.");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [portalUsername, setPortalUsername] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [busy, setBusy] = useState<"save" | "send" | "lookup" | "idle">("idle");
  const [message, setMessage] = useState("");

  const symbol = CURRENCIES[currency] ?? "$";
  const itemTotal = (item: Item) => Math.max(0, item.qty * item.unitPrice * (1 - item.discount / 100));
  const subtotal = items.reduce((sum, item) => sum + itemTotal(item), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const updateItem = (index: number, patch: Partial<Item>) =>
    setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  const lookupCustomer = async () => {
    if (!customerEmail) return;
    setBusy("lookup");
    setMessage("");
    try {
      const response = await fetch(`${API}/admin/customers/by-email/${encodeURIComponent(customerEmail)}`, { credentials: "include" });
      if (!response.ok) {
        setMessage("Customer not found — details can still be saved.");
        return;
      }
      const customer = await response.json();
      setCustomerName(customer.name ?? "");
      setCustomerCompany(customer.company ?? "");
      setCustomerPhone(customer.phone ?? "");
      setPortalUsername(customer.username ?? "");
      setPortalPassword(customer.portalPassword ?? "");
      setMessage(`✓ CRM record loaded for ${customer.name}`);
    } catch {
      setMessage("Customer lookup failed.");
    } finally {
      setBusy("idle");
    }
  };

  const save = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setMessage("Customer name and email are required.");
      return null;
    }
    setBusy("save");
    setMessage("");
    try {
      const payload = {
        invoiceNumber,
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        customerCountry,
        execName,
        execEmail,
        execPhone,
        currency,
        dueDate,
        paymentTerms,
        items: items.map(item => ({ ...item, finishing: item.finish, qty: Number(item.qty), unitPrice: Number(item.unitPrice), discount: Number(item.discount), total: itemTotal(item) })),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notesText: `${projectNotes}\n\n${footerNotes}`,
        status: "draft",
      };
      const response = await fetch(savedId ? `${API}/admin/invoices/${savedId}` : `${API}/admin/invoices`, {
        method: savedId ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to save invoice");
      setSavedId(result.id);
      setInvoiceNumber(result.invoiceNumber ?? invoiceNumber);
      if (result.portalUsername) setPortalUsername(result.portalUsername);
      if (result.portalPassword) setPortalPassword(result.portalPassword);
      setMessage(`✓ Saved ${result.invoiceNumber ?? invoiceNumber}`);
      return result.id as number;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save invoice");
      return null;
    } finally {
      setBusy("idle");
    }
  };

  const send = async () => {
    const id = savedId ?? await save();
    if (!id) return;
    setBusy("send");
    try {
      const response = await fetch(`${API}/admin/invoices/${id}/send`, { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error("Unable to send invoice");
      setMessage(`✓ Invoice sent to ${customerEmail}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send invoice");
    } finally {
      setBusy("idle");
    }
  };

  const print = async () => {
    await save();
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-5 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-800"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
          <span className="text-gray-200">|</span>
          <strong className="text-sm text-gray-900">Invoice Builder</strong>
          {message && <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${message.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{message}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void save()} disabled={busy !== "idle"} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"><Save className="h-4 w-4" />Save</button>
          <button onClick={() => void send()} disabled={busy !== "idle" || !customerEmail} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">{busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}Send to Customer</button>
          <button onClick={() => void print()} disabled={busy !== "idle"} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2f5a] px-3 py-2 text-sm font-medium text-white hover:bg-[#0d1f3c] disabled:opacity-50"><Printer className="h-4 w-4" />PDF / Print</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden print:block">
        <aside className="w-[370px] shrink-0 overflow-y-auto border-r bg-white print:hidden" style={{ height: "calc(100vh - 56px)" }}>
          <div className="p-4">
            <Section title="Invoice Information">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Invoice No."><input className={inputClass} value={invoiceNumber} onChange={event => setInvoiceNumber(event.target.value)} /></Field>
                <Field label="Invoice Date"><input type="date" className={inputClass} value={invoiceDate} onChange={event => setInvoiceDate(event.target.value)} /></Field>
                <Field label="Due Date"><input type="date" className={inputClass} value={dueDate} onChange={event => setDueDate(event.target.value)} /></Field>
                <Field label="Payment Terms"><input className={inputClass} value={paymentTerms} onChange={event => setPaymentTerms(event.target.value)} /></Field>
                <Field label="Currency"><select className={inputClass} value={currency} onChange={event => setCurrency(event.target.value)}>{Object.keys(CURRENCIES).map(value => <option key={value}>{value}</option>)}</select></Field>
                <Field label="Tax Rate %"><input type="number" className={inputClass} value={taxRate} onChange={event => setTaxRate(Number(event.target.value) || 0)} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Sales Executive"><input className={inputClass} value={execName} onChange={event => setExecName(event.target.value)} placeholder="Full name" /></Field>
                <Field label="Executive Email"><input className={inputClass} value={execEmail} onChange={event => setExecEmail(event.target.value)} /></Field>
                <Field label="Executive Phone"><input className={inputClass} value={execPhone} onChange={event => setExecPhone(event.target.value)} /></Field>
              </div>
            </Section>

            <Section title="Customer Details">
              <div className="flex items-end gap-2">
                <Field label="Customer Email"><input type="email" className={inputClass} value={customerEmail} onChange={event => setCustomerEmail(event.target.value)} placeholder="customer@email.com" /></Field>
                <button onClick={() => void lookupCustomer()} disabled={busy === "lookup" || !customerEmail} className="mb-0.5 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50">{busy === "lookup" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}CRM</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Name"><input className={inputClass} value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="Full name" /></Field>
                <Field label="Company"><input className={inputClass} value={customerCompany} onChange={event => setCustomerCompany(event.target.value)} /></Field>
                <Field label="Phone"><input className={inputClass} value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} /></Field>
                <Field label="Country"><input className={inputClass} value={customerCountry} onChange={event => setCustomerCountry(event.target.value)} /></Field>
              </div>
              <Field label="Project Notes"><textarea className={inputClass} rows={3} value={projectNotes} onChange={event => setProjectNotes(event.target.value)} /></Field>
              {portalUsername && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><strong>Customer portal</strong><div className="mt-1 font-mono">{portalUsername}{portalPassword ? ` · ${portalPassword}` : ""}</div></div>}
            </Section>

            <Section title="Line Items">
              {items.map((item, index) => (
                <div key={index} className="mb-2 overflow-hidden rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between border-b bg-[#1a2f5a]/5 px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f5a]">Item {String(index + 1).padStart(2, "0")}</span>
                    <div className="flex items-center gap-2"><strong className="text-xs text-[#1a2f5a]">{money(itemTotal(item), symbol)}</strong><button onClick={() => setItems(current => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current)} className="text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3">
                    <Field label="Product"><input className={inputClass} value={item.name} onChange={event => updateItem(index, { name: event.target.value })} placeholder="Custom Mailer Boxes" /></Field>
                    <Field label="Description"><input className={inputClass} value={item.description} onChange={event => updateItem(index, { description: event.target.value })} /></Field>
                    <Field label="Material"><input className={inputClass} value={item.material} onChange={event => updateItem(index, { material: event.target.value })} placeholder="300gsm SBS" /></Field>
                    <Field label="Finish"><input className={inputClass} value={item.finish} onChange={event => updateItem(index, { finish: event.target.value })} placeholder="Matte / Foil / Spot UV" /></Field>
                    <Field label="Printing"><input className={inputClass} value={item.printing} onChange={event => updateItem(index, { printing: event.target.value })} placeholder="4 Color CMYK" /></Field>
                    <Field label="Size"><input className={inputClass} value={item.size} onChange={event => updateItem(index, { size: event.target.value })} placeholder="W × H × D mm" /></Field>
                    <Field label="Quantity"><input type="number" className={inputClass} value={item.qty} onChange={event => updateItem(index, { qty: Number(event.target.value) || 0 })} /></Field>
                    <Field label="Unit Price"><input type="number" step="0.01" className={inputClass} value={item.unitPrice} onChange={event => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} /></Field>
                    <Field label="Discount %"><input type="number" className={inputClass} value={item.discount} onChange={event => updateItem(index, { discount: Number(event.target.value) || 0 })} /></Field>
                  </div>
                </div>
              ))}
              <button onClick={() => setItems(current => [...current, newItem()])} className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-xs font-bold uppercase tracking-wide text-gray-400 hover:border-[#1a2f5a] hover:text-[#1a2f5a]"><Plus className="h-3.5 w-3.5" />Add Line Item</button>
            </Section>

            <Section title="Footer Notes">
              <Field label="Payment / Terms Notes"><textarea className={inputClass} rows={3} value={footerNotes} onChange={event => setFooterNotes(event.target.value)} /></Field>
            </Section>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-300 p-8 print:bg-white print:p-0">
          <div className="mx-auto max-w-[794px] overflow-hidden bg-white shadow-2xl print:shadow-none" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            <div className="flex border-b-4" style={{ borderColor: NAVY }}>
              <div className="flex flex-1 items-center border-r px-7 py-5"><img src={LOGO_URL} alt="Prime Packaging Boxes" className="h-12 max-w-[220px] object-contain object-left" /></div>
              <div className="flex min-w-[240px] flex-col items-end justify-center px-8 py-5" style={{ background: NAVY }}><div className="text-[30px] font-black tracking-[0.25em] text-white">INVOICE</div><div className="my-2 h-0.5 w-10 bg-[#ffb800]" /><div className="text-[8px] uppercase tracking-[0.3em] text-white/60">Custom Packaging Services</div></div>
            </div>
            <div className="grid grid-cols-3 gap-6 border-b px-9 py-5">
              <div><div className="mb-2 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400">Bill To</div><div className="text-[15px] font-bold text-gray-900">{customerName || "[Customer Name]"}</div>{customerCompany && <div className="mt-0.5 text-[11px] text-gray-500">{customerCompany}</div>}<div className="mt-1.5 text-[10px] leading-6 text-gray-500">{customerEmail && <div>{customerEmail}</div>}{customerPhone && <div>{customerPhone}</div>}<div>{customerCountry}</div></div></div>
              <div><div className="mb-2 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400">From</div><div className="text-xs font-bold text-[#1a2f5a]">Prime Packaging Boxes</div>{execName && <div className="mt-0.5 text-[11px] text-gray-700">{execName}</div>}<div className="mt-1.5 text-[10px] leading-6 text-gray-500"><div>444 Alaska Avenue Suite</div><div>Torrance, CA 90503, USA</div><div>{execEmail}</div><div>{execPhone}</div></div></div>
              <div className="rounded-lg bg-gray-50 p-4"><div className="mb-2.5 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400">Invoice Details</div>{[["Invoice No.", invoiceNumber], ["Invoice Date", displayDate(invoiceDate)], ["Due Date", displayDate(dueDate)], ["Terms", paymentTerms]].map(([label, value]) => <div key={label} className="mb-1.5 flex justify-between gap-3 text-[10px]"><span className="font-semibold text-gray-500">{label}</span><strong className={label === "Due Date" ? "text-red-600" : "text-[#1a2f5a]"}>{value}</strong></div>)}</div>
            </div>
            {projectNotes && <div className="border-b bg-gray-50/70 px-9 py-3"><div className="mb-1 text-[8px] font-bold uppercase tracking-[0.3em] text-gray-400">Project Details</div><div className="whitespace-pre-wrap text-[11px] leading-5 text-gray-600">{projectNotes}</div></div>}
            <div className="px-9 pb-1"><table className="mt-3.5 w-full border-collapse text-[11px]"><thead><tr style={{ background: NAVY }} className="text-white">{["#", "Product / Description", "Specifications", "Qty", "Unit", "Total"].map((heading, index) => <th key={heading} className={`px-2.5 py-2 text-[8px] uppercase tracking-widest ${index > 2 ? "text-right" : "text-left"}`}>{heading}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={index} className="border-b border-gray-100 even:bg-gray-50"><td className="px-2.5 py-3 font-bold text-gray-300">{String(index + 1).padStart(2, "0")}</td><td className="px-2.5 py-3"><div className="font-bold text-gray-900">{item.name || "—"}</div>{item.description && <div className="mt-0.5 text-[10px] text-gray-500">{item.description}</div>}</td><td className="max-w-[180px] px-2.5 py-3 text-[9px] leading-4 text-gray-500">{[item.material, item.finish, item.printing, item.size].filter(Boolean).join(" · ") || "—"}</td><td className="px-2.5 py-3 text-right font-semibold">{item.qty.toLocaleString()}</td><td className="px-2.5 py-3 text-right">{money(item.unitPrice, symbol)}</td><td className="px-2.5 py-3 text-right font-bold text-[#1a2f5a]">{money(itemTotal(item), symbol)}</td></tr>)}</tbody></table></div>
            <div className="flex justify-end px-9 py-4"><div className="w-[280px]"><div className="flex justify-between border-b border-gray-100 py-2 text-[11px]"><span className="text-gray-500">Subtotal</span><strong>{money(subtotal, symbol)}</strong></div>{taxRate > 0 && <div className="flex justify-between border-b border-gray-100 py-2 text-[11px]"><span className="text-gray-500">Tax ({taxRate}%)</span><strong>{money(tax, symbol)}</strong></div>}<div className="mt-2 flex items-center justify-between rounded-md px-4 py-3" style={{ background: NAVY }}><div><div className="text-[8px] font-bold uppercase tracking-widest text-white/70">Amount Due ({currency})</div><div className="mt-1 text-[9px] text-[#ffb800]">Due {displayDate(dueDate)}</div></div><strong className="text-2xl text-[#ffb800]">{money(total, symbol)}</strong></div></div></div>
            {portalUsername && portalPassword && <div className="mx-9 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[10px] text-emerald-800"><strong>Customer Portal Access</strong><div className="mt-1 font-mono">{portalUsername} · {portalPassword}</div></div>}
            <div className="grid grid-cols-3 gap-5 border-t bg-gray-50 px-9 py-4 text-[10px] text-gray-500"><div><strong className="mb-1 block text-[8px] uppercase tracking-widest text-[#1a2f5a]">Price Includes</strong>Design, printing, finishing, die-cutting and quality check.</div><div><strong className="mb-1 block text-[8px] uppercase tracking-widest text-[#1a2f5a]">Production Time</strong>7–10 business days after artwork approval.</div><div><strong className="mb-1 block text-[8px] uppercase tracking-widest text-[#1a2f5a]">Notes & Terms</strong>{footerNotes}</div></div>
            <div className="flex items-center justify-between px-9 py-3 text-[9px] text-white" style={{ background: NAVY }}><span>✓ Premium Quality · ✓ Fast Turnaround · ✓ On-Time Delivery</span><span className="text-white/50">primepackagingboxes.com</span></div>
          </div>
        </main>
      </div>
      <style>{`@media print{@page{margin:0;size:A4}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.print\\\\:hidden{display:none!important}body{background:white!important}}`}</style>
    </div>
  );
}