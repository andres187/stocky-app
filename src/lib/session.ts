import AsyncStorage from '@react-native-async-storage/async-storage';

// Token de sesión del cliente (JWT devuelto por /api/customer-auth/otp/*).
// AsyncStorage, mismo mecanismo de persistencia que usa CartContext para el carrito.
const STORAGE_KEY = 'stocky_customer_token';

export function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): Promise<void> {
  return AsyncStorage.removeItem(STORAGE_KEY);
}
