import type {
  AuthResponse,
  CustodyEvent,
  EvidenceRecord,
  EvidenceUploadResponse,
  SignupInput,
  UserRecord,
  VerifyResult,
} from "./types";
import { clearToken, getToken } from "./auth-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(status: number, detail?: string) {
    super(detail ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function toErrorMessage(payload: unknown, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  const obj = payload as { detail?: unknown; message?: unknown };
  if (typeof obj.detail === "string") return obj.detail;
  if (typeof obj.message === "string") return obj.message;
  return fallback;
}

/**
 * Handles a 401 by clearing the stored token and bouncing to /login with a
 * "session expired" flag so the login page can explain what happened.
 */
function redirectOnExpiredSession(): void {
  if (typeof window === "undefined") return;
  const here = window.location.pathname;
  if (here.startsWith("/login") || here.startsWith("/signup")) return;
  const next = here ? `&next=${encodeURIComponent(here)}` : "";
  window.location.assign(`/login?expired=1${next}`);
}

async function parseError(res: Response): Promise<ApiError> {
  let message: string | undefined;
  try {
    const body = await res.json();
    message = toErrorMessage(body, res.statusText);
  } catch {
    message = res.statusText;
  }
  if (res.status === 401) {
    clearToken();
    redirectOnExpiredSession();
  }
  return new ApiError(res.status, message);
}

/**
 * Small fetch wrapper used by every API call in the app.
 * - Attaches `Authorization: Bearer <token>` when `auth: true`.
 * - Sends JSON bodies by default; set `form: true` for urlencoded payloads.
 * - On 401: logs the user out and redirects to /login?expired=1.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  opts: { auth?: boolean; form?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!opts.form) headers["Content-Type"] = "application/json";
  if (opts.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...headers, ...((init.headers as Record<string, string>) ?? {}) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Can't reach the CloudTrace API. Check that the backend is running.",
    );
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface HealthCheck {
  status: string;
}

export const HealthApi = {
  check(): Promise<HealthCheck> {
    return apiFetch<HealthCheck>("/health");
  },
};

export const AuthApi = {
  signup(input: SignupInput): Promise<UserRecord> {
    return apiFetch<UserRecord>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded.
    const body = new URLSearchParams({ username: email, password });
    return apiFetch<AuthResponse>(
      "/auth/login",
      { method: "POST", body },
      { form: true },
    );
  },
};

export const AdminApi = {
  pending(): Promise<UserRecord[]> {
    return apiFetch<UserRecord[]>("/auth/pending", {}, { auth: true });
  },

  users(): Promise<UserRecord[]> {
    return apiFetch<UserRecord[]>("/auth/users", {}, { auth: true });
  },

  approve(targetEmail: string, role: string): Promise<UserRecord> {
    const qs = `target_email=${encodeURIComponent(targetEmail)}&role=${encodeURIComponent(role)}`;
    return apiFetch<UserRecord>(`/auth/approve?${qs}`, { method: "POST" }, { auth: true });
  },

  revoke(targetEmail: string): Promise<UserRecord> {
    return apiFetch<UserRecord>(
      `/auth/revoke?target_email=${encodeURIComponent(targetEmail)}`,
      { method: "POST" },
      { auth: true },
    );
  },

  reject(targetEmail: string): Promise<{ status: string; email: string }> {
    return apiFetch<{ status: string; email: string }>(
      `/auth/reject?target_email=${encodeURIComponent(targetEmail)}`,
      { method: "POST" },
      { auth: true },
    );
  },
};

export const EvidenceApi = {
  mine(): Promise<EvidenceRecord[]> {
    return apiFetch<EvidenceRecord[]>("/evidence/mine", {}, { auth: true });
  },

  all(): Promise<EvidenceRecord[]> {
    return apiFetch<EvidenceRecord[]>("/evidence/all", {}, { auth: true });
  },

  get(evidenceId: string): Promise<EvidenceRecord> {
    return apiFetch<EvidenceRecord>(`/evidence/${evidenceId}`, {}, { auth: true });
  },

  upload(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<EvidenceUploadResponse> {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/evidence/upload`);
      const token = getToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as EvidenceUploadResponse);
          } catch {
            reject(new ApiError(xhr.status, "Received an invalid response from the server"));
          }
        } else {
          let detail: string | undefined;
          try {
            const body = JSON.parse(xhr.responseText);
            detail = toErrorMessage(body, xhr.statusText);
          } catch {
            detail = xhr.statusText;
          }
          if (xhr.status === 401) {
            clearToken();
            redirectOnExpiredSession();
          }
          reject(new ApiError(xhr.status, detail));
        }
      };

      xhr.onerror = () =>
        reject(new ApiError(0, "Can't reach the CloudTrace API while uploading."));
      xhr.send(form);
    });
  },

  verify(evidenceId: string): Promise<VerifyResult> {
    return apiFetch<VerifyResult>(
      `/evidence/${evidenceId}/verify`,
      { method: "POST" },
      { auth: true },
    );
  },

  custodyChain(evidenceId: string): Promise<CustodyEvent[]> {
    return apiFetch<CustodyEvent[]>(
      `/evidence/${evidenceId}/custody-chain`,
      { method: "GET" },
      { auth: true },
    );
  },
};

export async function uploadClientHash(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}