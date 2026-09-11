// Reglas de envío, portadas de web/src/lib/shipping.js.

export const FREE_SHIPPING_THRESHOLD = 250000;
export const SHIPPING_COST = 15000;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
}
