import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import type { Tenant } from "@/lib/types";

interface AuthContextValue {
  tenant: Tenant | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TENANT_KEY = "wp_tenant";

function loadStoredTenant(): Tenant | null {
  const raw = localStorage.getItem(TENANT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Tenant;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(() => (getToken() ? loadStoredTenant() : null));
  const [loading, setLoading] = useState(false);

  function persist(nextTenant: Tenant, token: string) {
    setToken(token);
    localStorage.setItem(TENANT_KEY, JSON.stringify(nextTenant));
    setTenant(nextTenant);
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<{ tenant: Tenant; token: string }>("/api/auth/login", { email, password }, { auth: false });
      persist(res.tenant, res.token);
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<{ tenant: Tenant; token: string }>("/api/auth/register", { name, email, password }, { auth: false });
      persist(res.tenant, res.token);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    localStorage.removeItem(TENANT_KEY);
    setTenant(null);
  }

  const value = useMemo(
    () => ({ tenant, isAuthenticated: !!tenant, loading, login, register, logout }),
    [tenant, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
