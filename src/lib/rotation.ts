// Debe coincidir con ROTATION_WINDOW_MS del backend (backend/src/config.js) y con
// web/src/lib/rotation.js — solo decide cuándo volver a pedir el catálogo, el
// orden real lo decide el servidor.
export const ROTATION_WINDOW_MS = 60 * 60 * 1000;

export function currentWindow(now = Date.now()): number {
  return Math.floor(now / ROTATION_WINDOW_MS);
}

export function msUntilNextWindow(now = Date.now()): number {
  return ROTATION_WINDOW_MS - (now % ROTATION_WINDOW_MS);
}
