/**
 * Bites API client — bridges the frontend SPA to the Quarkus backend (PRD §16).
 * All requests go through the Vite dev proxy (/api -> http://localhost:8080).
 * When the backend is unreachable the app transparently falls back to local simulation.
 */
import { Restaurant, MenuItem, PromoCode, Order } from '../models/types';

const API_BASE = '/api/v1';
const idempotencyKey = () => 'idem-' + crypto.randomUUID();

let backendAvailable: boolean | null = null;

export async function pingBackend(timeoutMs = 1500): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${API_BASE}/restaurants`, { signal: ctrl.signal });
    clearTimeout(t);
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  return backendAvailable;
}

export function resetBackendCache(): void {
  backendAvailable = null;
}

function unwrap<T>(raw: any): T {
  if (raw && typeof raw === 'object' && 'success' in raw && 'data' in raw) {
    return (raw as any).data as T;
  }
  return raw as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any).message || (err as any).error || `GET ${path} failed: ${res.status}`;
    throw new Error(msg);
  }
  const raw = await res.json();
  return unwrap<T>(raw);
}

const POST_FAILED = 'Request failed:';

async function post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as any).message || (err as any).error || `${POST_FAILED} ${path} (${res.status})`;
    throw new Error(msg);
  }
  const raw = await res.json();
  return unwrap<T>(raw);
}

export const api = {
  async getRestaurants(): Promise<Restaurant[]> {
    return get<Restaurant[]>('/restaurants');
  },

  async getMenu(restaurantId: string): Promise<MenuItem[]> {
    return get<MenuItem[]>(`/restaurants/${restaurantId}/menu`);
  },

  async getAllMenuItems(): Promise<MenuItem[]> {
    const restaurants = await api.getRestaurants();
    const all: MenuItem[] = [];
    for (const r of restaurants) {
      try { all.push(...(await api.getMenu(r.id))); } catch { /* skip */ }
    }
    return all;
  },

  async getPromos(): Promise<PromoCode[]> {
    return get<PromoCode[]>('/promos');
  },

  /** POST /orders with Idempotency-Key (PRD FR-X.6). */
  async placeOrder(payload: {
    restaurantId: string;
    serviceMode: string;
    items: {
      menuItemId: string;
      quantity: number;
      selectedModifiers: { groupId: string; groupName: string; optionId: string; optionName: string; price: number }[];
      specialInstructions?: string;
    }[];
    address: string;
    addressNotes?: string;
    lat: number;
    lng: number;
    paymentMethod: string;
    promoCode?: string;
    tip: number;
  }): Promise<{ id: string; orderNumber: string; status: string; pin: string; grandTotal: number }> {
    return post(`/orders`, payload, { 'Idempotency-Key': idempotencyKey() });
  },

  /** Simulated gateway settlement — triggers the Midtrans webhook flow server-side. */
  async simulatePayment(orderId: string): Promise<void> {
    await post(`/payments/${orderId}/simulate-success`, {});
  },

  async getOrder(orderId: string): Promise<Order> {
    return get<Order>(`/orders/${orderId}`);
  },

  async getOrderList(): Promise<Order[]> {
    return get<Order[]>('/orders');
  },

  async submitRating(orderId: string, rating: { foodStars: number; courierStars: number; comment?: string }): Promise<void> {
    await post(`/orders/${orderId}/rating`, rating);
  },
};

// ----- Restaurant portal -----
export const restaurantApi = {
  async orders(): Promise<Order[]> {
    return get<Order[]>('/restaurant/me/orders');
  },
  async accept(orderId: string, prepTimeMinutes?: number): Promise<void> {
    await post(`/restaurant/me/orders/${orderId}/accept`, { prepTimeMinutes: prepTimeMinutes || 15 });
  },
  async startPrep(orderId: string): Promise<void> {
    await post(`/restaurant/me/orders/${orderId}/start-prep`, {});
  },
  async ready(orderId: string): Promise<void> {
    await post(`/restaurant/me/orders/${orderId}/ready`, {});
  },
  async reject(orderId: string, reason: string): Promise<void> {
    await post(`/restaurant/me/orders/${orderId}/reject`, { reason });
  },
  async setAvailability(itemId: string, available: boolean): Promise<void> {
    const res = await fetch(`${API_BASE}/restaurant/me/menu/items/${itemId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available }),
    });
    if (!res.ok) throw new Error('Failed to update availability');
  },
};

// ----- Courier portal -----
export const courierApi = {
  async me(): Promise<any> {
    return get<any>('/courier/me');
  },
  async jobs(): Promise<Order[]> {
    return get<Order[]>('/courier/me/jobs');
  },
  async offers(): Promise<Order[]> {
    return get<Order[]>('/courier/me/offers');
  },
  async accept(orderId: string): Promise<void> {
    await post(`/courier/orders/${orderId}/accept`, {});
  },
  async updateStatus(orderId: string, to: string): Promise<void> {
    await post(`/courier/orders/${orderId}/status`, { to });
  },
  async location(lat: number, lng: number, heading: number): Promise<void> {
    await post(`/courier/location`, { lat, lng, heading });
  },
  async deliver(orderId: string, pin: string): Promise<void> {
    await post(`/courier/orders/${orderId}/deliver`, { pin });
  },
};

// ----- Admin -----
export const adminApi = {
  async promos(): Promise<PromoCode[]> {
    return get<PromoCode[]>('/admin/promos');
  },
  async togglePromo(code: string, isActive: boolean): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/promos/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!res.ok) throw new Error('Failed to update promo');
  },
};

/**
 * Subscribe to the tracking WebSocket channel (PRD §16.9).
 * Frames: order_status, courier_assigned, courier_location, eta_update, tracking_ended.
 * Returns a disposer. Auto-reconnects every 2s while the page is open.
 */
export function subscribeTracking(
  orderId: string,
  onEvent: (evt: any) => void,
  onOpen?: () => void
): () => void {
  let closed = false;
  let ws: WebSocket | null = null;
  let timer: number | null = null;
  const connect = () => {
    if (closed) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    ws = new WebSocket(`${proto}://${location.host}/ws/tracking/${orderId}`);
    ws.onopen = () => { if (!closed) onOpen?.(); };
    ws.onmessage = (msg) => {
      try { onEvent(JSON.parse(msg.data)); } catch { /* ignore malformed frames */ }
    };
    ws.onclose = () => {
      if (closed) return;
      timer = window.setTimeout(() => { if (!closed) connect(); }, 2000);
    };
  };
  connect();
  return () => { closed = true; if (timer !== null) clearTimeout(timer); try { ws?.close(); } catch { /* already closed */ } };
}

