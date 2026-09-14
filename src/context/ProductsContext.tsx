import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { apiFetch } from '../lib/api';
import type { Product } from '../lib/types';
import { msUntilNextWindow, ROTATION_WINDOW_MS } from '../lib/rotation';

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

  // La vitrina rota cada hora en el backend (ver rotationService.js). Un primer
  // timeout hasta el próximo cambio de ventana y luego un intervalo cada hora,
  // más un refresco al volver a primer plano — el caso principal en móvil, donde
  // la app puede pasar horas en segundo plano.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      refetch();
      interval = setInterval(refetch, ROTATION_WINDOW_MS);
    }, msUntilNextWindow());

    function onAppStateChange(status: AppStateStatus) {
      if (status === 'active') refetch();
    }
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      subscription.remove();
    };
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
