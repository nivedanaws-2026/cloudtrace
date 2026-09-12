"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, AuthApi } from "@/lib/api";
import {
  clearToken,
  decodeToken,
  getToken,
  setToken,
} from "@/lib/auth-store";
import type { Role, SessionUser, SignupInput, UserRecord } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (input: SignupInput) => Promise<UserRecord>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    const payload = decodeToken(stored);
    setTokenState(stored);
    setUser(
      payload?.sub
        ? { id: payload.sub, role: (payload.role ?? "investigator") as Role, email: "" }
        : null,
    );
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (email: string, password: string, remember: boolean) => {
      const res = await AuthApi.login(email, password);
      setToken(res.access_token, remember);
      const payload = decodeToken(res.access_token);
      setTokenState(res.access_token);
      setUser({
        id: payload?.sub ?? "",
        role: (payload?.role ?? "investigator") as Role,
        email,
      });
      setStatus("authenticated");
    },
    [],
  );

  const signup = useCallback(async (input: SignupInput) => {
    return AuthApi.signup(input);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // If any API call returns 401, the ApiError helper already clears the token —
  // reflect that in the session state here.
  useEffect(() => {
    if (!token && status === "authenticated") {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [token, status]);

  const value = useMemo(
    () => ({ user, token, status, login, signup, logout }),
    [user, token, status, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}