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

export type OrderStatus = 'pending' | 'paid' | 'failed';

export type OrderItem = {
  productId: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export type ShippingContact = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
};

export type ShipmentStatus =
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type ShipmentEvent = { status: ShipmentStatus; note: string | null; createdAt: string };

export type Shipment = {
  status: ShipmentStatus;
  trackingNumber: string | null;
  carrier: string | null;
  updatedAt: string;
  history: ShipmentEvent[];
};

export type Payment = { wompiTransactionId: string; status: string; paymentMethodType: string };

export type Order = {
  id: number;
  reference: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingContact: ShippingContact;
  items: OrderItem[];
  shipment: Shipment | null;
  payment: Payment | null;
  createdAt: string;
  // Solo presente en la respuesta de POST /orders/checkout para un método async
  // (PSE) en PENDING — el backend nunca lo persiste, es puntual a esa respuesta.
  redirectUrl?: string;
};

export type CheckoutPaymentMethod =
  | { type: 'CARD'; token: string; installments: number }
  | {
      type: 'PSE';
      user_type: 0 | 1;
      user_legal_id_type: string;
      user_legal_id: string;
      financial_institution_code: string;
      payment_description: string;
    };

export type CheckoutPayload = {
  customer: { fullName: string; email: string; phone: string; address: string; city: string; notes?: string };
  lines: { productId: Product['id']; color: string; size: string; quantity: number }[];
  amountInCents: number;
  paymentMethod: CheckoutPaymentMethod;
  idempotencyKey: string;
};

export type PseBank = { code: string; name: string };

export type Review = {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  orderId: number | null;
  rating: number;
  body: string | null;
  status: 'published' | 'hidden';
  createdAt: string;
  updatedAt: string;
};
