import { ApiError, EvidenceApi } from "./api";
import { demoSystemComponents } from "./demo-data";
import type {
  CustodyEvent,
  EvidenceRecord,
  SessionUpload,
  SystemComponent,
  VerifyResult,
} from "./types";

export type { SystemComponent };

const SESSION_KEY = "cloudtrace.session.uploads.v1";
const INTEGRITY_KEY = "cloudtrace.integrity.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Integrity registry — the backend does not persist a "last verification"
 * column, so the UI keeps the latest per-evidence verify result for the
 * session and surfaces it in list badges.
 */
export function getIntegrity(evidenceId: string): EvidenceRecord["status"] {
  const map = readJson<Record<string, boolean>>(INTEGRITY_KEY, {});
  const intact = map[evidenceId];
  if (intact === undefined) return "unverified";
  return intact ? "intact" : "mismatch";
}

export function recordIntegrity(evidenceId: string, intact: boolean): void {
  const map = readJson<Record<string, boolean>>(INTEGRITY_KEY, {});
  map[evidenceId] = intact;
  writeJson(INTEGRITY_KEY, map);
}

/** Evidence IDs uploaded this browser session — the MVP fallback list. */
export function getSessionUploads(): SessionUpload[] {
  return readJson<SessionUpload[]>(SESSION_KEY, []);
}

export function addSessionUpload(upload: SessionUpload): void {
  const list = getSessionUploads();
  if (!list.some((s) => s.evidence_id === upload.evidence_id)) {
    list.push(upload);
    writeJson(SESSION_KEY, list);
  }
}

export interface EvidenceListResult {
  records: EvidenceRecord[];
  fromDemo: boolean;
}

function decorate(rows: EvidenceRecord[]): EvidenceRecord[] {
  return rows
    .filter((r) => r && r.id)
    .map((r) => ({ ...r, status: getIntegrity(r.id) }));
}

function isServerSideError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403 || error.status === 404)
  );
}

export async function loadMyEvidence(
  userEmail: string,
): Promise<EvidenceListResult> {
  try {
    const rows = await EvidenceApi.mine();
    const records = decorate(rows);
    const session = getSessionUploads();
    for (const s of session) {
      if (!records.some((r) => r.id === s.evidence_id)) {
        records.push({
          id: s.evidence_id,
          filename: s.filename,
          sha256_hash: s.sha256_hash,
          uploaded_by: "",
          uploaded_email: userEmail,
          uploaded_at: new Date().toISOString(),
          status: getIntegrity(s.evidence_id),
          source: "session",
        });
      }
    }
    return { records, fromDemo: false };
  } catch (error) {
    if (isServerSideError(error)) throw error;
    return {
      records: getSessionUploads().map<EvidenceRecord>((s) => ({
        id: s.evidence_id,
        filename: s.filename,
        sha256_hash: s.sha256_hash,
        uploaded_by: "",
        uploaded_email: userEmail,
        uploaded_at: new Date().toISOString(),
        status: getIntegrity(s.evidence_id),
        source: "session",
      })),
      fromDemo: true,
    };
  }
}

export async function loadAllEvidence(): Promise<EvidenceListResult> {
  try {
    const rows = await EvidenceApi.all();
    return { records: decorate(rows), fromDemo: false };
  } catch (error) {
    if (isServerSideError(error)) throw error;
    return { records: [], fromDemo: true };
  }
}

export async function loadCustodyChain(
  evidenceId: string,
): Promise<CustodyEvent[]> {
  return EvidenceApi.custodyChain(evidenceId);
}

export async function runVerification(
  evidenceId: string,
): Promise<VerifyResult> {
  const result = await EvidenceApi.verify(evidenceId);
  recordIntegrity(evidenceId, result.integrity_intact);
  return result;
}

export function systemStatusForHealth(health: { status: string } | null) {
  return demoSystemComponents(health);
}

export function validateEvidenceId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}