// Clave de idempotencia para el checkout: se genera una sola vez por intento de
// compra y se reusa en los reintentos, para que un reintento de red no duplique
// el cobro (ver backend: orders.UNIQUE(customer_id, idempotency_key)). No hay
// expo-crypto entre las dependencias, así que basta con timestamp + aleatorio.
export function newIdempotencyKey() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
