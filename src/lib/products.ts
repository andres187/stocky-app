import { apiFetch } from './api';
import type { Product } from './types';

// "Más vendidos" real (ventas pagadas de 48h, con relleno del backend). Ver
// backend/src/services/productsService.js#destacados.
export function fetchDestacados(limit = 3): Promise<Product[]> {
  return apiFetch<Product[]>(`/products/destacados?limit=${limit}`);
}

export type SugeridosParams = {
  refs?: Array<Product['id']>;
  categoria?: string;
  limit?: number;
};

// Franja "También te puede gustar". `refs` son ids de productos ya en el carrito.
export function fetchSugeridos({ refs = [], categoria, limit = 6 }: SugeridosParams = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  for (const id of refs) params.append('ref', String(id));
  if (categoria) params.set('categoria', categoria);
  params.set('limit', String(limit));
  return apiFetch<Product[]>(`/products/sugeridos?${params.toString()}`);
}
