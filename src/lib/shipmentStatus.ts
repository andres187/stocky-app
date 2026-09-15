// Única fuente de verdad de cómo se presenta el estado del envío en la app.
// Réplica de shipmentStatus.js en el proyecto web — son deployables separados,
// así que ambas copias se mantienen sincronizadas a mano si el flujo cambia.
import type { Shipment, ShipmentStatus } from './types';

export const STATUS_FLOW: ShipmentStatus[] = ['pending', 'preparing', 'shipped', 'out_for_delivery', 'delivered'];
export const TERMINAL_STATUSES: ShipmentStatus[] = ['cancelled', 'returned'];

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  pending: 'Pagado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  returned: 'Devuelto',
};

export type TimelineStepState = 'done' | 'current' | 'pending';

export type TimelineStep = {
  key: ShipmentStatus;
  label: string;
  state: TimelineStepState;
  date: string | null;
};

// Cruza el flujo fijo de 5 pasos con el historial real para saber cuáles ya
// pasaron (con su fecha), cuál es el actual, y cuáles faltan. Si el envío está
// en un estado terminal (cancelado/devuelto), los pasos del flujo se marcan
// "done" solo si de verdad ocurrieron (según el historial) y se agrega el
// paso de excepción al final como el estado actual.
export function buildTimeline(shipment: Shipment | null): TimelineStep[] {
  if (!shipment) return [];

  const dateByStatus = new Map<ShipmentStatus, string>();
  for (const event of shipment.history) {
    if (!dateByStatus.has(event.status)) dateByStatus.set(event.status, event.createdAt);
  }

  const isTerminal = TERMINAL_STATUSES.includes(shipment.status);
  const currentIdx = isTerminal ? Infinity : STATUS_FLOW.indexOf(shipment.status);

  const steps: TimelineStep[] = STATUS_FLOW.map((key, idx) => {
    const happened = isTerminal ? dateByStatus.has(key) : idx < currentIdx;
    return {
      key,
      label: STATUS_LABEL[key],
      state: happened ? 'done' : idx === currentIdx ? 'current' : 'pending',
      date: dateByStatus.get(key) ?? null,
    };
  });

  if (isTerminal) {
    steps.push({
      key: shipment.status,
      label: STATUS_LABEL[shipment.status],
      state: 'current',
      date: dateByStatus.get(shipment.status) ?? shipment.updatedAt,
    });
  }

  return steps;
}
