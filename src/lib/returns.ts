import { apiFetch } from './api';
import type { ReturnReason, ReturnRequest } from './types';

export function listMyReturns() {
  return apiFetch<ReturnRequest[]>('/returns/me');
}

export function createReturnRequest(payload: { orderId: number; reason: ReturnReason; body?: string }) {
  return apiFetch<ReturnRequest>('/returns', { method: 'POST', body: JSON.stringify(payload) });
}

export function cancelReturnRequest(id: number) {
  return apiFetch<ReturnRequest>(`/returns/${id}/cancelar`, { method: 'POST' });
}
