import { apiFetch } from './api';
import type { Review } from './types';

export function listMyReviews() {
  return apiFetch<Review[]>('/reviews/me');
}

export function createReview(payload: { productId: number; rating: number; body?: string }) {
  return apiFetch<Review>('/reviews', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateReview(id: number, payload: { rating: number; body?: string }) {
  return apiFetch<Review>(`/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deleteReview(id: number) {
  return apiFetch<null>(`/reviews/${id}`, { method: 'DELETE' });
}
