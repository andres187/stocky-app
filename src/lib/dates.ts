// Ayudas de fechas para la ventana de devolución (15 días desde que se
// confirma recibido). Réplica de ../../web/src/lib/dates.js — misma
// convención de sincronización a mano que shipmentStatus.ts.
export const RECEIPT_HOLD_DAYS = 15;

export function daysSince(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const ms = Date.now() - new Date(dateIso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function returnDeadline(receivedAtIso: string | null): Date | null {
  if (!receivedAtIso) return null;
  const deadline = new Date(receivedAtIso);
  deadline.setDate(deadline.getDate() + RECEIPT_HOLD_DAYS);
  return deadline;
}

// Días que quedan para pedir devolución; null si nunca se confirmó recibido,
// 0 o negativo si ya venció.
export function daysLeftToReturn(receivedAtIso: string | null): number | null {
  const deadline = returnDeadline(receivedAtIso);
  if (!deadline) return null;
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
