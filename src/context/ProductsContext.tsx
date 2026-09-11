import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';
import type { Product } from '../lib/types';

type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Product[]>('/products');
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refetch }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts debe usarse dentro de ProductsProvider');
  return ctx;
}
