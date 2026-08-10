import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SESSION_KEY = 'portal_session_cookie';

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return ''; // same-origin fallback for web
}

export async function getStoredCookie(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

async function storeSessionCookie(setCookie: string | null): Promise<void> {
  if (!setCookie) return;
  // Extract just the name=value part, e.g. "connect.sid=s%3A..."
  const value = setCookie.split(';')[0];
  if (value) await AsyncStorage.setItem(SESSION_KEY, value);
}

export async function clearStoredCookie(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (Platform.OS !== 'web') {
    const cookie = await getStoredCookie();
    if (cookie) headers['Cookie'] = cookie;
  }
  return headers;
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${getBaseUrl()}${path}`;
  const headers = await buildHeaders(init.headers as Record<string, string>);
  return fetch(url, {
    ...init,
    headers,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });
}

export async function portalLogin(username: string, password: string): Promise<{ customer: Customer }> {
  const url = `${getBaseUrl()}/api/portal/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? 'Login failed');
  if (Platform.OS !== 'web') {
    await storeSessionCookie(res.headers.get('set-cookie'));
  }
  return data;
}

export async function portalLogout(): Promise<void> {
  await apiFetch('/api/portal/logout', { method: 'POST' });
  await clearStoredCookie();
}

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

export async function fetchPortalMe(): Promise<Customer> {
  const res = await apiFetch('/api/portal/me');
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function fetchPortalOrders(): Promise<Order[]> {
  const res = await apiFetch('/api/portal/orders');
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
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

export async function fetchPortalQuotes(): Promise<Quote[]> {
  const res = await apiFetch('/api/portal/quotes');
  if (!res.ok) throw new Error('Failed to load quotes');
  return res.json();
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
  createdAt: string;
}

export async function fetchPortalInvoices(): Promise<Invoice[]> {
  const res = await apiFetch('/api/portal/invoices');
  if (!res.ok) throw new Error('Failed to load invoices');
  return res.json();
}
