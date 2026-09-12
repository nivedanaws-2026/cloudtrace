import type { Role } from "./types";

export const TOKEN_KEY = "cloudtrace.jwt";
export const TOKEN_KEY_SESSION = "cloudtrace.jwt.session";

export interface JwtPayload {
  sub?: string;
  role?: Role;
  exp?: number;
  iat?: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(`${normalized}${padding}`);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    window.localStorage.getItem(TOKEN_KEY) ??
    window.sessionStorage.getItem(TOKEN_KEY_SESSION);
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || isExpired(payload)) {
    clearToken();
    return null;
  }
  return token;
}

export function setToken(token: string, remember: boolean): void {
  if (remember) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.sessionStorage.setItem(TOKEN_KEY_SESSION, token);
  }
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY_SESSION);
}

export function roleLabel(role: Role): string {
  return role.toUpperCase();
}

export const roleColors: Record<Role, string> = {
  investigator: "text-cyan-300 bg-cyan-400/10 border-cyan-400/25",
  custodian: "text-amber-300 bg-amber-400/10 border-amber-400/25",
  auditor: "text-violet-300 bg-violet-400/10 border-violet-400/25",
  admin: "text-rose-300 bg-rose-400/10 border-rose-400/25",
};