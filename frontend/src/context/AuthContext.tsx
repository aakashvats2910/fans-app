"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, TOKEN_STORAGE_KEY, extractErrorMessage } from "@/lib/api";
import { AuthResponse, UserSummary } from "@/lib/types";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: "FAN" | "CREATOR";
}

interface AuthContextValue {
  user: UserSummary | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
      api
        .get<UserSummary>("/api/users/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const applyAuth = useCallback((data: AuthResponse) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      try {
        const res = await api.post<AuthResponse>("/api/auth/login", {
          usernameOrEmail,
          password,
        });
        applyAuth(res.data);
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Invalid username/email or password"));
      }
    },
    [applyAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const res = await api.post<AuthResponse>("/api/auth/register", payload);
        applyAuth(res.data);
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Could not create your account"));
      }
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!window.localStorage.getItem(TOKEN_STORAGE_KEY)) return;
    const res = await api.get<UserSummary>("/api/users/me");
    setUser(res.data);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
