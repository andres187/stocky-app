import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch } from '../lib/api';
import { clearToken, setToken } from '../lib/session';
import type { AuthChannel, AuthResult, Customer } from '../lib/types';

const AuthContext = createContext<AuthContextValue | null>(null);

type Identifier = { channel: AuthChannel; email?: string; regionCode?: string; phone?: string };

type AuthContextValue = {
  customer: Customer | null;
  loading: boolean;
  requestCode: (id: Identifier, isLogin: boolean) => Promise<AuthResult>;
  loginWithCode: (id: Identifier, code: string) => Promise<AuthResult>;
  register: (
    id: Identifier,
    fullName: string,
    lastName: string,
    code: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la app, si ya hay un token guardado se valida contra /me — así una
  // sesión sobrevive a cerrar y volver a abrir, igual que el carrito con AsyncStorage.
  useEffect(() => {
    apiFetch<Customer>('/customer-auth/me')
      .then(setCustomer)
      .catch(() => {
        setCustomer(null);
        clearToken().catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  const requestCode = useCallback(async (id: Identifier, isLogin: boolean): Promise<AuthResult> => {
    try {
      await apiFetch('/customer-auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ ...id, isLogin }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: errorMessage(err) };
    }
  }, []);

  const loginWithCode = useCallback(async (id: Identifier, code: string): Promise<AuthResult> => {
    try {
      const { token, customer: loggedIn } = await apiFetch<{ token: string; customer: Customer }>(
        '/customer-auth/otp/login',
        { method: 'POST', body: JSON.stringify({ ...id, code }) }
      );
      await setToken(token);
      setCustomer(loggedIn);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: errorMessage(err) };
    }
  }, []);

  const register = useCallback(
    async (id: Identifier, fullName: string, lastName: string, code: string): Promise<AuthResult> => {
      try {
        const { token, customer: created } = await apiFetch<{ token: string; customer: Customer }>(
          '/customer-auth/otp/register',
          { method: 'POST', body: JSON.stringify({ ...id, fullName, lastName, code }) }
        );
        await setToken(token);
        setCustomer(created);
        return { ok: true };
      } catch (err) {
        return { ok: false, message: errorMessage(err) };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await clearToken();
    setCustomer(null);
  }, []);

  const value: AuthContextValue = { customer, loading, requestCode, loginWithCode, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
