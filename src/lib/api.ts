import { getToken } from './session';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || (data.errors && data.errors.join(' ')) || message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return res.json();
}
