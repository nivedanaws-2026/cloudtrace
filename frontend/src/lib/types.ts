export type Role = "investigator" | "custodian" | "auditor" | "admin";

export type IntegrityStatus = "intact" | "mismatch" | "unverified";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export interface UserRecord {
  id: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SignupInput {
  email: string;
  password: string;
}

export interface EvidenceRecord {
  id: string;
  filename: string;
  sha256_hash: string;
  uploaded_by: string;
  uploaded_email: string;
  uploaded_at: string;
  status: IntegrityStatus;
  source?: "api" | "session" | "demo";
}

export type CustodyAction =
  | "upload"
  | "access"
  | "transfer"
  | "verify"
  | "verify_mismatch"
  | "seal"
  | "release"
  | "destroy";

export interface CustodyEvent {
  action: CustodyAction;
  actor_id: string;
  actor_email?: string;
  timestamp: string;
  event_hash: string;
  prev_event_hash: string | null;
}

export interface VerifyResult {
  evidence_id: string;
  original_hash: string;
  current_hash: string;
  integrity_intact: boolean;
}

export interface EvidenceUploadResponse {
  evidence_id: string;
  filename: string;
  sha256_hash: string;
}

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

export interface SessionUpload {
  evidence_id: string;
  filename: string;
  sha256_hash: string;
}

export interface SystemComponent {
  id: string;
  label: string;
  status: "operational" | "degraded" | "offline";
  note?: string;
}

export type UploadStage = "uploading" | "hashing" | "securing" | "custody" | "complete";

export type VerifyStage = "reading" | "hashing" | "comparing" | "chain" | "result";

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
}