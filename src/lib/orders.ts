import { apiFetch } from './api';
import type { CheckoutPayload, Order, PseBank } from './types';

export function listOrders() {
  return apiFetch<Order[]>('/orders');
}

export function getOrder(id: number | string) {
  return apiFetch<Order>(`/orders/${id}`);
}

export function checkout(payload: CheckoutPayload) {
  return apiFetch<Order>('/orders/checkout', { method: 'POST', body: JSON.stringify(payload) });
}

export function listPseBanks() {
  return apiFetch<PseBank[]>('/payments/pse/banks');
}

export function confirmReceived(id: number | string) {
  return apiFetch<Order>(`/orders/${id}/recibido`, { method: 'POST' });
}
