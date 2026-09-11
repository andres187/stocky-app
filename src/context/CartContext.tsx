import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useProducts } from './ProductsContext';
import type { AddItemResult, CartLine, CartLineWithProduct, Product } from '../lib/types';

const STORAGE_KEY = 'stocky_cart';
const CartContext = createContext<CartContextValue | null>(null);

type Lines = Record<string, CartLine>;

type CartContextValue = {
  items: CartLineWithProduct[];
  count: number;
  subtotal: number;
  addItem: (productId: Product['id'], color: string, size: string, qty?: number) => AddItemResult;
  incLine: (key: string) => AddItemResult;
  decLine: (key: string) => void;
  setLineQty: (key: string, qty: number) => AddItemResult;
  removeLine: (key: string) => void;
  clearCart: () => void;
};

function lineKey(productId: Product['id'], color: string, size: string) {
  return productId + '__' + color + '__' + size;
}

export function variantStockFor(product: Product | undefined, color: string | null, size: string | null) {
  const entry = product?.variantStock?.find((v) => v.color === color && v.size === size);
  return entry ? entry.stock : null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [lines, setLines] = useState<Lines>({});
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setLines(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addItem = useCallback(
    (productId: Product['id'], color: string, size: string, qty = 1): AddItemResult => {
      const product = products.find((p) => String(p.id) === String(productId));
      const limit = variantStockFor(product, color, size);
      const key = lineKey(productId, color, size);

      if (!Number.isInteger(qty) || qty < 1) {
        return { ok: false, message: 'La cantidad debe ser un entero mayor o igual a 1.' };
      }

      if (limit != null) {
        const currentQty = lines[key]?.qty || 0;
        if (currentQty + qty > limit) {
          return {
            ok: false,
            message:
              limit === 0
                ? `${color} / talla ${size} está agotado.`
                : `Solo quedan ${limit} unidades de ${color} / talla ${size}.`,
          };
        }
      }

      setLines((prev) => ({
        ...prev,
        [key]: {
          productId,
          color,
          size,
          qty: (prev[key]?.qty || 0) + qty,
        },
      }));
      return { ok: true };
    },
    [products, lines]
  );

  const incLine = useCallback(
    (key: string): AddItemResult => {
      const line = lines[key];
      if (!line) return { ok: false };

      const product = products.find((p) => String(p.id) === String(line.productId));
      const limit = variantStockFor(product, line.color, line.size);

      if (limit != null && line.qty + 1 > limit) {
        return { ok: false, message: `Solo quedan ${limit} unidades de ${line.color} / talla ${line.size}.` };
      }

      setLines((prev) => ({ ...prev, [key]: { ...prev[key], qty: prev[key].qty + 1 } }));
      return { ok: true };
    },
    [lines, products]
  );

  const decLine = useCallback((key: string) => {
    setLines((prev) => {
      const line = prev[key];
      if (!line) return prev;
      if (line.qty <= 1) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...line, qty: line.qty - 1 } };
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setLineQty = useCallback(
    (key: string, qty: number): AddItemResult => {
      const line = lines[key];
      if (!line) return { ok: false, message: 'Esa línea no está en el carrito.' };
      if (!Number.isInteger(qty) || qty < 0) {
        return { ok: false, message: 'La cantidad debe ser un entero mayor o igual a 0.' };
      }

      const product = products.find((p) => String(p.id) === String(line.productId));
      const limit = variantStockFor(product, line.color, line.size);
      if (limit != null && qty > limit) {
        return { ok: false, message: `Solo quedan ${limit} unidades de ${line.color} / talla ${line.size}.` };
      }

      setLines((prev) => {
        if (!prev[key]) return prev;
        if (qty === 0) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return { ...prev, [key]: { ...prev[key], qty } };
      });
      return { ok: true };
    },
    [lines, products]
  );

  const clearCart = useCallback(() => setLines({}), []);

  const items = useMemo(
    () =>
      Object.entries(lines)
        .map(([key, line]) => ({
          key,
          ...line,
          product: products.find((p) => String(p.id) === String(line.productId)),
        }))
        .filter((i): i is CartLineWithProduct => Boolean(i.product) && i.qty > 0),
    [lines, products]
  );

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.product.price, 0);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    addItem,
    incLine,
    decLine,
    setLineQty,
    removeLine,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
