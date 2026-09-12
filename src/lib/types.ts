export type ProductColor = { name: string; hex: string };

export type VariantStock = { color: string; size: string; stock: number };

export type Product = {
  id: number | string;
  name: string;
  cat: string;
  desc: string;
  price: number;
  oldPrice?: number | null;
  img: string;
  badge?: 'new' | 'low' | null;
  colors: ProductColor[];
  sizes: string[];
  active: boolean;
  variantStock?: VariantStock[];
  bestsellerOrder?: number | null;
};

export type Category = { key: string; label: string };

export type CartLine = { productId: Product['id']; color: string; size: string; qty: number };

export type CartLineWithProduct = CartLine & { key: string; product: Product };

export type AddItemResult = { ok: boolean; message?: string };

export type Customer = {
  id: number;
  email: string;
  fullName: string;
  lastName: string | null;
  regionCode: string | null;
  phone: string | null;
};

export type AuthChannel = 'sms' | 'email';

export type AuthResult = { ok: true } | { ok: false; message: string };
