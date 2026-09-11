import type { Product } from '../lib/types';

export function filterProducts(categoria: string, products: Product[]): Product[] {
  if (!categoria || categoria === 'todo') return products;
  if (categoria === 'nuevo') return products.filter((p) => p.badge === 'new');
  if (categoria === 'ofertas') return products.filter((p) => p.oldPrice);
  return products.filter((p) => p.cat === categoria);
}
