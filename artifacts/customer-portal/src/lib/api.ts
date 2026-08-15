const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? '';

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  username: string;
  email: string;
  customerNumber: string;
  company?: string | null;
  phone?: string | null;
  createdAt?: string | null;
}

export interface OrderItem {
  name: string;
  description?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: string | number;
  currency: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface Quote {
  id: number;
  status: string;
  productType?: string | null;
  quantity?: string | null;
  dimensions?: string | null;
  material?: string | null;
  printingDetails?: string | null;
  additionalNotes?: string | null;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  total: string | number | null;
  currency: string;
  dueDate?: string | null;
  sentAt?: string | null;
  orderId?: number | null;
  customerName?: string | null;
  execName?: string | null;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function portalLogin(username: string, password: string): Promise<{ customer: Customer }> {
  const res = await apiFetch('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? 'Login failed');
  return data;
}

export async function portalLogout(): Promise<void> {
  await apiFetch('/api/portal/logout', { method: 'POST' });
}

export async function fetchPortalMe(): Promise<Customer> {
  const res = await apiFetch('/api/portal/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export async function fetchPortalOrders(): Promise<Order[]> {
  const res = await apiFetch('/api/portal/orders');
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}

export async function fetchPortalOrderById(id: number): Promise<Order> {
  const orders = await fetchPortalOrders();
  const found = orders.find(o => o.id === id);
  if (!found) throw new Error('Order not found');
  return found;
}

export async function fetchPortalQuotes(): Promise<Quote[]> {
  const res = await apiFetch('/api/portal/quotes');
  if (!res.ok) throw new Error('Failed to load quotes');
  return res.json();
}

export async function fetchPortalInvoices(): Promise<Invoice[]> {
  const res = await apiFetch('/api/portal/invoices');
  if (!res.ok) throw new Error('Failed to load invoices');
  return res.json();
}
