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

async function parseError(res: Response): Promise<ApiError> {
  let message: string | undefined;
  try {
    const body = await res.json();
    message = toErrorMessage(body, res.statusText);
  } catch {
    message = res.statusText;
  }
  if (res.status === 401) clearToken();
  return new ApiError(res.status, message);
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean; skipContentType?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!opts?.skipContentType) headers["Content-Type"] = "application/json";
  if (opts?.auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
    cache: "no-store",
  });

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const AuthApi = {
  signup(input: SignupInput): Promise<UserRecord> {
    return request<UserRecord>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    const body = new URLSearchParams({ username: email, password });
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body,
    }, { skipContentType: true });
  },
};

export const HealthApi = {
  async check(): Promise<{ status: string }> {
    return request<{ status: string }>("/health");
  },
};

export const EvidenceApi = {
  async list(): Promise<EvidenceRecord[]> {
    return request<EvidenceRecord[]>("/evidence", { method: "GET" }, { auth: true });
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
          reject(new ApiError(xhr.status, detail));
        }
      };

      xhr.onerror = () => reject(new ApiError(0, "Network error while uploading evidence"));
      xhr.send(form);
    });
  },

  verify(evidenceId: string): Promise<VerifyResult> {
    return request<VerifyResult>(
      `/evidence/${evidenceId}/verify`,
      { method: "POST" },
      { auth: true },
    );
  },

  custodyChain(evidenceId: string): Promise<CustodyEvent[]> {
    return request<CustodyEvent[]>(
      `/evidence/${evidenceId}/custody-chain`,
      { method: "GET" },
      { auth: true },
    );
  },
};

export class NotImplementedEndpointError extends Error {
  constructor() {
    super("This backend endpoint is not implemented yet. Showing demo data instead.");
    this.name = "NotImplementedEndpointError";
  }
}

export async function uploadClientHash(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}