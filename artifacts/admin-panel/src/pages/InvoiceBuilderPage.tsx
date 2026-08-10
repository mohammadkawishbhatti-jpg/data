import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import { Link } from "wouter";
import { ArrowLeft, Printer, Plus, X, ChevronUp, ChevronDown, Save, Send, Search, Loader2, Link2, User, KeyRound } from "lucide-react";

const NAVY = "#1a2f5a";
const LOGO_URL = "/api/uploads/prime-packaging-logo.svg";
const SYMBOLS: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", PKR: "₨", AED: "د.إ" };
const COUNTRIES = ["United States","United Kingdom","Pakistan","United Arab Emirates","Canada","Australia","Germany","France","Other"];
const EMPTY_ITEM = { name:"",desc:"",material:"",lamination:"",printing:"",size:"",finishing:"",packing:"",qty:500,unitPrice:0,discount:0 };

function today() { return new Date().toISOString().split("T")[0]; }
function addDays(n:number) { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; }
function fmtDate(s:string) { if(!s) return "—"; return new Date(s+"T00:00:00").toLocaleDateString("en-US",{day:"2-digit",month:"long",year:"numeric"}); }
function fmtMoney(n:number,sym:string) { return sym+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

function Sec({ title, children }:{ title:string; children:React.ReactNode }) {
  const [o,setO]=useState(true);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
      <button type="button" onClick={()=>setO(!o)} className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">
        {title}{o?<ChevronUp className="h-3.5 w-3.5"/>:<ChevronDown className="h-3.5 w-3.5"/>}
      </button>
      {o&&<div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}
function F({ label, children }:{ label:string; children:React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>{children}</div>;
}
const inp = "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[13px] text-gray-800 focus:outline-none focus:border-[#1a2f5a] focus:ring-2 focus:ring-[#1a2f5a]/10";

export default function InvoiceBuilderPage() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const [invoiceNumber,setInvoiceNumber] = useState(()=>`INV-${new Date().toISOString().slice(2,10).replace(/-/g,"")}-001`);
  const [invoiceDate,setInvoiceDate]     = useState(today);
  const [dueDate,setDueDate]             = useState(()=>addDays(30));
  const [paymentTerms,setPaymentTerms]   = useState("Net 30");
  const [currency,setCurrency]           = useState("USD");
  const [taxRate,setTaxRate]             = useState(0);
  const [execName,setExecName]           = useState("");
  const [execTitle,setExecTitle]         = useState("Sales Executive");
  const [execPhone,setExecPhone]         = useState("818-758-4076");
  const [execEmail,setExecEmail]         = useState("help@primepackagingboxes.com");
  const [customerName,setCustomerName]   = useState("");
  const [customerCompany,setCustomerCompany] = useState("");
  const [customerEmail,setCustomerEmail] = useState("");
  const [customerPhone,setCustomerPhone] = useState("");
  const [customerCountry,setCustomerCountry] = useState("United States");
  const [projectNotes,setProjectNotes]   = useState("Thank you for your business. Please find below your invoice for custom packaging services.");
  const [items,setItems]                 = useState([{...EMPTY_ITEM}]);
  const [infoPrice,setInfoPrice]         = useState("Premium quality material, printing, finishing, die-cutting, quality check & export packing.");
  const [infoProd,setInfoProd]           = useState("5–7 working days after artwork approval and advance payment.");
  const [infoDel,setInfoDel]             = useState("3–5 working days via DHL / FedEx / UPS after dispatch.");
  const [infoNotes,setInfoNotes]         = useState("Payment due within 30 days. Late payments subject to 1.5% monthly interest.");
  const [savedId,setSavedId]             = useState<number|null>(null);
  const [customerId,setCustomerId]       = useState<number|null>(null);
  const [linkedOrderId,setLinkedOrderId] = useState<number|null>(null);
  const [linkedOrderNumber,setLinkedOrderNumber] = useState("");
  const [saving,setSaving]               = useState(false);
  const [sending,setSending]             = useState(false);
  const [lookupLoading,setLookupLoading] = useState(false);
  const [lookupMsg,setLookupMsg]         = useState("");
  const [orderLookupLoading,setOrderLookupLoading] = useState(false);
  const [orderLookupMsg,setOrderLookupMsg] = useState("");
  const [orderIdInput,setOrderIdInput]   = useState("");
  const [msg,setMsg]                     = useState("");
  const [portalUsername,setPortalUsername] = useState("");
  const [portalPassword,setPortalPassword] = useState("");
  const [portalAccountCreated,setPortalAccountCreated] = useState(false);

  const sym = SYMBOLS[currency]||"$";
  const lineTotal=(item:typeof EMPTY_ITEM)=>{const g=(item.qty||0)*(item.unitPrice||0);return g-g*(item.discount||0)/100;};
  const subtotal=items.reduce((s,i)=>s+lineTotal(i),0);
  const taxAmt=subtotal*(taxRate/100);
  const grandTotal=subtotal+taxAmt;

  const setItem=(idx:number,k:string,v:any)=>setItems(p=>p.map((it,i)=>i===idx?{...it,[k]:v}:it));
  const addItem=()=>setItems(p=>[...p,{...EMPTY_ITEM}]);
  const removeItem=(idx:number)=>setItems(p=>p.length>1?p.filter((_,i)=>i!==idx):p);

  const handleLookup=async()=>{
    if(!customerEmail)return; setLookupLoading(true); setLookupMsg("");
    try{
      const r=await fetch(`${API}/admin/customers/by-email/${encodeURIComponent(customerEmail)}`,{credentials:"include"});
      if(r.ok){
        const c=await r.json();
        setCustomerName(c.name||"");
        setCustomerCompany(c.company||"");
        setCustomerPhone(c.phone||"");
        setCustomerId(c.id);
        if(c.username) setPortalUsername(c.username);
        if(c.portalPassword) { setPortalPassword(c.portalPassword); setPortalAccountCreated(false); }
        setLookupMsg(`✓ ${c.name}`);
      } else setLookupMsg("Not found — will auto-create on save");
    } finally{setLookupLoading(false);}
  };

  const handleOrderLookup=async()=>{
    const id=Number(orderIdInput.replace(/\D/g,""));
    if(!id)return;
    setOrderLookupLoading(true); setOrderLookupMsg("");
    try{
      const r=await fetch(`${API}/admin/orders/${id}`,{credentials:"include"});
      if(!r.ok){setOrderLookupMsg("Order not found"); return;}
      const o=await r.json();
      setLinkedOrderId(o.id);
      setLinkedOrderNumber(o.orderNumber||`#${o.id}`);
      if(o.customerEmail) setCustomerEmail(o.customerEmail);
      if(o.customerName)  setCustomerName(o.customerName);
      if(o.currency)      setCurrency(o.currency);
      if(Array.isArray(o.items)&&o.items.length>0){
        setItems(o.items.map((it:any)=>({
          name:       it.name        || it.product || "",
          desc:       it.description || it.desc    || "",
          material:   it.material    || "",
          lamination: it.lamination  || "",
          printing:   it.printing    || "",
          size:       it.size        || (it.dimensions?`${it.dimensions}`:""),
          finishing:  it.finishing   || "",
          packing:    it.packing     || "",
          qty:        Number(it.qty||it.quantity||0)||500,
          unitPrice:  Number(it.unitPrice||it.price||0)||0,
          discount:   Number(it.discount||0)||0,
        })));
      }
      setOrderLookupMsg(`✓ Linked: Order ${o.orderNumber||`#${o.id}`} · ${o.customerName||o.customerEmail||""}`);
    } finally{setOrderLookupLoading(false);}
  };

  // Returns the saved invoice ID (handles async state)
  const handleSave=async():Promise<number|null>=>{
    setSaving(true);setMsg("");
    try{
      const payload={
        invoiceNumber,currency,dueDate,paymentTerms,
        customerId,orderId:linkedOrderId,
        customerEmail,customerName,customerCompany,customerPhone,customerCountry,
        execName,execTitle,execPhone,execEmail,
        items:items.map(i=>({...i,qty:Number(i.qty),unitPrice:Number(i.unitPrice),discount:Number(i.discount),total:lineTotal(i)})),
        subtotal:String(subtotal.toFixed(2)),tax:String(taxAmt.toFixed(2)),total:String(grandTotal.toFixed(2)),
        priceIncludes:infoPrice,productionTime:infoProd,delivery:infoDel,notesText:projectNotes+"\n\n"+infoNotes,
        status:"draft",
      };
      const r=await fetch(savedId?`${API}/admin/invoices/${savedId}`:`${API}/admin/invoices`,{
        method:savedId?"PATCH":"POST",credentials:"include",
        headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
      });
      if(!r.ok){setMsg("❌ Save failed");return savedId;}
      const d=await r.json();
      const newId=d.id;
      setSavedId(newId);
      setInvoiceNumber(d.invoiceNumber||invoiceNumber);
      // Handle portal credentials from auto-create
      if(d.portalUsername){
        setPortalUsername(d.portalUsername);
        if(!customerId) setCustomerId(d.customerId||null);
      }
      if(d.portalPassword){
        setPortalPassword(d.portalPassword);
        setPortalAccountCreated(d.portalAccountCreated||false);
      }
      setMsg(`✓ Saved: ${d.invoiceNumber||invoiceNumber}${d.portalAccountCreated?" · Portal account created":"" }`);
      return newId;
    }finally{setSaving(false);}
    return null;
  };

  const handleSend=async()=>{
    if(!customerEmail){setMsg("❌ Add customer email first");return;}
    setSending(true);setMsg("");
    try{
      // Always save first and use returned ID
      const id=savedId ?? await handleSave();
      if(!id){setMsg("❌ Save first");setSending(false);return;}
      const r=await fetch(`${API}/admin/invoices/${id}/send`,{method:"POST",credentials:"include"});
      if(!r.ok){setMsg("❌ Send failed");return;}
      setMsg(`✓ Sent to ${customerEmail}`);
    }finally{setSending(false);}
  };

  const handlePrintAndSave=async()=>{
    const id=await handleSave();
    if(!id){return;}
    // Auto-create order if no linked order yet
    if(!linkedOrderId && customerEmail){
      try{
        const orderPayload={
          customerEmail,customerName:customerName||customerEmail,currency,status:"confirmed",
          items:items.map(i=>({
            name:i.name||i.desc||"Box",description:i.desc||"",material:i.material||"",
            printing:i.printing||"",dimensions:i.size||"",
            qty:Number(i.qty)||1,unitPrice:Number(i.unitPrice)||0,discount:Number(i.discount)||0,total:lineTotal(i),
          })),
          totalAmount:String(grandTotal.toFixed(2)),
          notes:`Auto-created from Invoice ${invoiceNumber}`,
        };
        const r=await fetch(`${API}/admin/orders`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(orderPayload)});
        if(r.ok){
          const ord=await r.json();
          const ordNum=ord.orderNumber||`#${ord.id}`;
          // flushSync forces React to flush these state updates synchronously
          // so the DOM re-renders with the order number BEFORE window.print() reads it
          flushSync(()=>{
            setLinkedOrderId(ord.id);
            setLinkedOrderNumber(ordNum);
            setMsg(`✓ Saved · Order ${ordNum} created`);
          });
        }
      }catch(e){/* non-blocking */}
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Topbar */}
      <div className="bg-white border-b h-14 flex items-center justify-between px-5 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href={`${base}/`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-800"><ArrowLeft className="h-4 w-4"/>Dashboard</Link>
          <span className="text-gray-200">|</span>
          <span className="font-semibold text-gray-900 text-sm">Invoice Builder</span>
          {msg&&<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${msg.startsWith("✓")?"bg-green-50 text-green-700":"bg-red-50 text-red-600"}`}>{msg}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            {saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}Save
          </button>
          <button onClick={handleSend} disabled={sending||!customerEmail} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-50">
            {sending?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}Send to Customer
          </button>
          <button onClick={handlePrintAndSave} className="flex items-center gap-1.5 bg-[#1a2f5a] hover:bg-[#0d1f3c] text-white rounded-lg px-3 py-2 text-sm font-medium">
            <Printer className="h-4 w-4"/>PDF / Print
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden print:block">
        {/* Left Panel */}
        <aside className="w-[360px] flex-shrink-0 bg-white border-r overflow-y-auto print:hidden" style={{height:"calc(100vh - 56px)"}}>
          <div className="p-4">
            <Sec title="Invoice Info">
              {/* Order linking */}
              <div className={`rounded-lg border px-3 py-2.5 space-y-2 ${linkedOrderId?"bg-blue-50 border-blue-200":"bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <Link2 className="h-3 w-3"/>{linkedOrderId?"Linked Order":"Link to Order (optional)"}
                </div>
                {linkedOrderId?(
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700">✓ Order {linkedOrderNumber}</span>
                    <button type="button" onClick={()=>{setLinkedOrderId(null);setLinkedOrderNumber("");setOrderIdInput("");setOrderLookupMsg("");}} className="text-[10px] text-gray-400 hover:text-red-500">Unlink</button>
                  </div>
                ):(
                  <div className="flex gap-2">
                    <input className={inp+" flex-1"} value={orderIdInput} onChange={e=>setOrderIdInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleOrderLookup()} placeholder="Order ID or #ORD-..." />
                    <button onClick={handleOrderLookup} disabled={orderLookupLoading||!orderIdInput} className="flex items-center gap-1 border rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-white disabled:opacity-50 whitespace-nowrap">
                      {orderLookupLoading?<Loader2 className="h-3 w-3 animate-spin"/>:<Link2 className="h-3 w-3"/>}Link
                    </button>
                  </div>
                )}
                {orderLookupMsg&&<p className={`text-xs ${orderLookupMsg.startsWith("✓")?"text-green-700":"text-amber-600"}`}>{orderLookupMsg}</p>}
                {!linkedOrderId&&<p className="text-[10px] text-gray-400">Enter an Order ID to auto-fill customer info and line items.</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <F label="Invoice No."><input className={inp} value={invoiceNumber} onChange={e=>setInvoiceNumber(e.target.value)}/></F>
                <F label="Invoice Date"><input type="date" className={inp} value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)}/></F>
                <F label="Due Date"><input type="date" className={inp} value={dueDate} onChange={e=>setDueDate(e.target.value)}/></F>
                <F label="Payment Terms"><input className={inp} value={paymentTerms} onChange={e=>setPaymentTerms(e.target.value)}/></F>
                <F label="Currency"><select className={inp} value={currency} onChange={e=>setCurrency(e.target.value)}>{Object.keys(SYMBOLS).map(c=><option key={c}>{c}</option>)}</select></F>
                <F label="Tax Rate %"><input type="number" min={0} max={100} step={0.1} className={inp} value={taxRate} onChange={e=>setTaxRate(Number(e.target.value)||0)}/></F>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <F label="Exec Name"><input className={inp} value={execName} onChange={e=>setExecName(e.target.value)} placeholder="Full name"/></F>
                <F label="Title"><input className={inp} value={execTitle} onChange={e=>setExecTitle(e.target.value)}/></F>
                <F label="Exec Phone"><input className={inp} value={execPhone} onChange={e=>setExecPhone(e.target.value)}/></F>
                <F label="Exec Email"><input type="email" className={inp} value={execEmail} onChange={e=>setExecEmail(e.target.value)}/></F>
              </div>
            </Sec>

            <Sec title="Customer Details">
              <div className="flex gap-2 items-end">
                <F label="Customer Email"><input type="email" className={inp} value={customerEmail} onChange={e=>{setCustomerEmail(e.target.value);setPortalUsername("");setPortalPassword("");setPortalAccountCreated(false);}} placeholder="customer@email.com"/></F>
                <button onClick={handleLookup} disabled={lookupLoading||!customerEmail} className="mb-0.5 flex items-center gap-1 border rounded-lg px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap">
                  {lookupLoading?<Loader2 className="h-3 w-3 animate-spin"/>:<Search className="h-3 w-3"/>}CRM
                </button>
              </div>
              {lookupMsg&&<p className={`text-xs ${lookupMsg.startsWith("✓")?"text-green-700":"text-amber-600"}`}>{lookupMsg}</p>}
              <div className="grid grid-cols-2 gap-2">
                <F label="Name"><input className={inp} value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full name"/></F>
                <F label="Company"><input className={inp} value={customerCompany} onChange={e=>setCustomerCompany(e.target.value)}/></F>
                <F label="Phone"><input className={inp} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)}/></F>
                <F label="Country"><select className={inp} value={customerCountry} onChange={e=>setCustomerCountry(e.target.value)}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></F>
              </div>
              <F label="Project Notes"><textarea className={inp} rows={2} value={projectNotes} onChange={e=>setProjectNotes(e.target.value)}/></F>

              {/* Portal credentials (shown after save if auto-created) */}
              {portalUsername&&(
                <div className={`rounded-lg border p-3 space-y-2 ${portalAccountCreated?"bg-emerald-50 border-emerald-200":"bg-blue-50 border-blue-200"}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <User className="h-3 w-3"/>Customer Portal Access
                    {portalAccountCreated&&<span className="ml-auto bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">NEW</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Username</p>
                      <p className="text-xs font-mono font-semibold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1">{portalUsername}</p>
                    </div>
                    {portalPassword&&(
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Password</p>
                        <p className="text-xs font-mono font-semibold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1">{portalPassword}</p>
                      </div>
                    )}
                  </div>
                  {portalAccountCreated&&<p className="text-[10px] text-emerald-700">✓ Account auto-created. Credentials shown on PDF.</p>}
                </div>
              )}
            </Sec>

            <Sec title="Line Items">
              {items.map((item,i)=>(
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden mb-2">
                  <div className="flex items-center justify-between px-3 py-2 bg-[#1a2f5a]/5 border-b border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1a2f5a]">Item {String(i+1).padStart(2,"0")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1a2f5a]">{fmtMoney(lineTotal(item),sym)}</span>
                      <button type="button" onClick={()=>removeItem(i)} className="text-gray-300 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2">
                    <F label="Product"><input className={inp} value={item.name} onChange={e=>setItem(i,"name",e.target.value)} placeholder="Custom Mailer Boxes"/></F>
                    <F label="Description"><input className={inp} value={item.desc} onChange={e=>setItem(i,"desc",e.target.value)}/></F>
                    <F label="Material"><input className={inp} value={item.material} onChange={e=>setItem(i,"material",e.target.value)} placeholder="300gsm SBS"/></F>
                    <F label="Lamination"><input className={inp} value={item.lamination} onChange={e=>setItem(i,"lamination",e.target.value)} placeholder="Matte / Gloss"/></F>
                    <F label="Printing"><input className={inp} value={item.printing} onChange={e=>setItem(i,"printing",e.target.value)} placeholder="4 Color CMYK"/></F>
                    <F label="Size (W×H×D)"><input className={inp} value={item.size} onChange={e=>setItem(i,"size",e.target.value)} placeholder="W×H×D mm"/></F>
                    <F label="Finishing"><input className={inp} value={item.finishing} onChange={e=>setItem(i,"finishing",e.target.value)} placeholder="Spot UV, Foil"/></F>
                    <F label="Packing"><input className={inp} value={item.packing} onChange={e=>setItem(i,"packing",e.target.value)} placeholder="Flat Packed"/></F>
                    <F label="Quantity"><input type="number" className={inp} value={item.qty} onChange={e=>setItem(i,"qty",Number(e.target.value)||0)}/></F>
                    <F label="Unit Price"><input type="number" step="0.01" className={inp} value={item.unitPrice} onChange={e=>setItem(i,"unitPrice",Number(e.target.value)||0)}/></F>
                    <F label="Discount %"><input type="number" step="1" min={0} max={100} className={inp} value={item.discount} onChange={e=>setItem(i,"discount",Number(e.target.value)||0)}/></F>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide text-gray-400 hover:border-[#1a2f5a] hover:text-[#1a2f5a] flex items-center justify-center gap-1.5 transition-colors">
                <Plus className="h-3.5 w-3.5"/>Add Line Item
              </button>
            </Sec>

            <Sec title="Footer Info">
              <F label="Price Includes"><textarea className={inp} rows={2} value={infoPrice} onChange={e=>setInfoPrice(e.target.value)}/></F>
              <F label="Production Time"><textarea className={inp} rows={2} value={infoProd} onChange={e=>setInfoProd(e.target.value)}/></F>
              <F label="Delivery"><textarea className={inp} rows={2} value={infoDel} onChange={e=>setInfoDel(e.target.value)}/></F>
              <F label="Payment Notes"><textarea className={inp} rows={2} value={infoNotes} onChange={e=>setInfoNotes(e.target.value)}/></F>
            </Sec>
          </div>
        </aside>

        {/* ── Document Preview ── */}
        <main className="flex-1 overflow-y-auto bg-gray-300 p-8 flex justify-center print:p-0 print:bg-white print:block">
          <div style={{width:794,background:"#fff",boxShadow:"0 4px 24px rgba(0,0,0,0.15)",fontFamily:"Arial,Helvetica,sans-serif",display:"flex",flexDirection:"column"}}>

            {/* ── Header ── */}
            <div style={{display:"flex",alignItems:"stretch",borderBottom:`4px solid ${NAVY}`}}>
              <div style={{padding:"20px 28px",display:"flex",alignItems:"center",flex:1,borderRight:"1px solid #e5e7eb"}}>
                <img src={LOGO_URL} alt="Prime Packaging Boxes" style={{height:48,width:"auto",maxWidth:220,objectFit:"contain",objectPosition:"left"}}
                  onError={e=>{const el=e.target as HTMLImageElement;el.style.display="none";el.insertAdjacentHTML("afterend",`<div style="font-size:16px;font-weight:900;color:${NAVY};letter-spacing:1px">PRIME PACKAGING BOXES</div>`);}}/>
              </div>
              <div style={{background:NAVY,padding:"20px 32px",display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",minWidth:240}}>
                <div style={{color:"#fff",fontSize:30,fontWeight:900,letterSpacing:4,textTransform:"uppercase",lineHeight:1}}>INVOICE</div>
                <div style={{width:40,height:2,background:"#FFB800",margin:"8px 0"}}/>
                <div style={{color:"rgba(255,255,255,0.6)",fontSize:8,letterSpacing:3,textTransform:"uppercase"}}>Custom Packaging Services</div>
              </div>
            </div>

            {/* ── Invoice meta + From/To ── */}
            <div style={{padding:"20px 36px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:24,borderBottom:"1px solid #e5e7eb"}}>
              <div>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>Bill To</div>
                <div style={{fontSize:15,fontWeight:700,color:"#111827"}}>{customerName||"[Customer Name]"}</div>
                {customerCompany&&<div style={{fontSize:11,color:"#6b7280",marginTop:2}}>{customerCompany}</div>}
                <div style={{fontSize:10,color:"#6b7280",marginTop:5,lineHeight:1.8}}>
                  {customerEmail&&<div>{customerEmail}</div>}
                  {customerPhone&&<div>{customerPhone}</div>}
                  {customerCountry&&<div>{customerCountry}</div>}
                </div>
              </div>
              <div>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#9ca3af",marginBottom:8}}>From</div>
                <div style={{fontSize:12,fontWeight:700,color:NAVY}}>Prime Packaging Boxes</div>
                {execName&&<div style={{fontSize:11,color:"#374151",marginTop:2}}>{execName}{execTitle?` · ${execTitle}`:""}</div>}
                <div style={{fontSize:10,color:"#6b7280",marginTop:5,lineHeight:1.8}}>
                  <div>444 Alaska Avenue Suite</div>
                  <div>Torrance, CA 90503, USA</div>
                  {execEmail&&<div style={{marginTop:2}}>{execEmail}</div>}
                  {execPhone&&<div>{execPhone}</div>}
                </div>
              </div>
              <div style={{background:"#f9fafb",borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#9ca3af",marginBottom:10}}>Invoice Details</div>
                {[
                  ["Invoice No.",invoiceNumber],
                  ["Invoice Date",fmtDate(invoiceDate)],
                  ["Due Date",fmtDate(dueDate)],
                  ["Terms",paymentTerms],
                  ["Order Ref.", linkedOrderNumber || (savedId ? `INV-REF-${savedId}` : "Auto on Print")],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:9,color:"#6b7280",fontWeight:600}}>{l}</span>
                    <span style={{fontSize:10,fontWeight:700,color:l==="Due Date"?"#dc2626":l==="Order Ref."?"#059669":NAVY}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Project Notes ── */}
            {projectNotes&&(
              <div style={{padding:"12px 36px",borderBottom:"1px solid #f3f4f6",background:"#fafafa"}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#9ca3af",marginBottom:5}}>Project Details</div>
                <div style={{fontSize:11,color:"#4b5563",lineHeight:1.7}}>{projectNotes}</div>
              </div>
            )}

            {/* ── Items Table ── */}
            <div style={{padding:"0 36px 4px"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11,marginTop:14}}>
                <thead>
                  <tr style={{background:NAVY,color:"#fff"}}>
                    {["#","Product / Description","Specifications","Qty","Unit Price","Disc","Total"].map((h,i)=>(
                      <th key={h} style={{padding:"9px 10px",textAlign:i>=3?"right":"left",fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item,i)=>{
                    const net=lineTotal(item);
                    const specs=[item.material&&`Material: ${item.material}`,item.lamination&&`Lam: ${item.lamination}`,item.printing&&`Print: ${item.printing}`,item.size&&`Size: ${item.size}`,item.finishing&&`Finish: ${item.finishing}`,item.packing&&`Pack: ${item.packing}`].filter(Boolean).join("  ·  ");
                    return (
                      <tr key={i} style={{borderBottom:"1px solid #f3f4f6",background:i%2===0?"#fff":"#f9fafb"}}>
                        <td style={{padding:"11px 10px",color:"#d1d5db",fontWeight:700,width:24}}>{String(i+1).padStart(2,"0")}</td>
                        <td style={{padding:"11px 10px"}}>
                          <div style={{fontWeight:700,color:"#111827"}}>{item.name||"—"}</div>
                          {item.desc&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>{item.desc}</div>}
                        </td>
                        <td style={{padding:"11px 10px",fontSize:9.5,color:"#6b7280",maxWidth:160,lineHeight:1.5}}>{specs||"—"}</td>
                        <td style={{padding:"11px 10px",textAlign:"right",fontWeight:600}}>{(item.qty||0).toLocaleString()}</td>
                        <td style={{padding:"11px 10px",textAlign:"right"}}>{fmtMoney(item.unitPrice||0,sym)}</td>
                        <td style={{padding:"11px 10px",textAlign:"right",color:item.discount>0?"#dc2626":"#9ca3af",fontSize:10}}>{item.discount>0?`${item.discount}%`:"—"}</td>
                        <td style={{padding:"11px 10px",textAlign:"right",fontWeight:700,color:NAVY}}>{fmtMoney(net,sym)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Totals ── */}
            <div style={{padding:"12px 36px 20px",display:"flex",justifyContent:"flex-end"}}>
              <div style={{width:280}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f6",fontSize:11}}>
                  <span style={{color:"#6b7280"}}>Subtotal</span>
                  <span style={{fontWeight:600,color:"#374151"}}>{fmtMoney(subtotal,sym)}</span>
                </div>
                {taxRate>0&&(
                  <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f6",fontSize:11}}>
                    <span style={{color:"#6b7280"}}>Tax ({taxRate}%)</span>
                    <span style={{fontWeight:600,color:"#374151"}}>{fmtMoney(taxAmt,sym)}</span>
                  </div>
                )}
                <div style={{background:NAVY,borderRadius:6,padding:"13px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                  <div>
                    <div style={{fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>Amount Due ({currency})</div>
                    <div style={{fontSize:9,color:"#FFB800",marginTop:3}}>Due {fmtDate(dueDate)}</div>
                  </div>
                  <span style={{fontSize:24,fontWeight:900,color:"#FFB800"}}>{fmtMoney(grandTotal,sym)}</span>
                </div>
              </div>
            </div>

            {/* ── Portal Credentials (shown on PDF if auto-created) ── */}
            {portalUsername&&portalPassword&&(
              <div style={{margin:"0 36px 16px",border:"1.5px solid #bbf7d0",borderRadius:8,background:"#f0fdf4",padding:"14px 18px"}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#15803d",marginBottom:10}}>Customer Portal Access</div>
                <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:9,color:"#6b7280",marginBottom:3}}>Portal URL</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#111827"}}>primepackagingboxes.com/customer-portal/</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#6b7280",marginBottom:3}}>Username</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{portalUsername}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#6b7280",marginBottom:3}}>Password</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#111827",fontFamily:"monospace"}}>{portalPassword}</div>
                  </div>
                </div>
                <div style={{fontSize:9,color:"#16a34a",marginTop:8}}>✓ Use these credentials to track your order status, view invoices, and manage your account.</div>
              </div>
            )}

            {/* ── Info footer ── */}
            <div style={{borderTop:"1px solid #e5e7eb",padding:"16px 36px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18,background:"#f9fafb"}}>
              {[["Price Includes",infoPrice],["Production Time",infoProd],["Delivery",infoDel]].map(([t,v])=>(
                <div key={t}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:NAVY,marginBottom:5}}>{t}</div>
                  <div style={{fontSize:10,color:"#6b7280",lineHeight:1.7}}>{v}</div>
                </div>
              ))}
              {infoNotes&&(
                <div style={{gridColumn:"1/-1",borderTop:"1px solid #e5e7eb",paddingTop:10,marginTop:4}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:NAVY,marginBottom:5}}>Payment Terms</div>
                  <div style={{fontSize:10,color:"#6b7280",lineHeight:1.7}}>{infoNotes}</div>
                </div>
              )}
            </div>

            {/* ── Bottom footer ── */}
            <div style={{background:NAVY,padding:"12px 36px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px 16px"}}>
                {["Premium Quality","Fast Turnaround","On-Time Delivery","Competitive Pricing","100% Satisfaction"].map(b=>(
                  <span key={b} style={{fontSize:9,color:"rgba(255,255,255,0.8)",display:"flex",alignItems:"center",gap:4}}>
                    <span style={{color:"#FFB800"}}>✓</span>{b}
                  </span>
                ))}
              </div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:9}}>primepackagingboxes.com</div>
            </div>

          </div>
        </main>
      </div>

      {/* Print styles with color-adjust fix */}
      <style>{`
        @media print {
          @page { margin: 0; size: A4; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
