export type Role = "investigator" | "custodian" | "auditor" | "admin";

export type IntegrityStatus = "intact" | "compromised";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export interface UserRecord {
  id: string;
  email: string;
  role: Role;
  displayName?: string;
  created_at: string;
  lastActive?: string;
  status?: "active" | "suspended";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SignupInput {
  email: string;
  password: string;
  role: Role;
}

export interface EvidenceRecord {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  sha256_hash: string;
  uploadedBy: string;
  uploadedByName: string;
  uploaded_at: string;
  status: IntegrityStatus;
  source: "api" | "demo";
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
  id?: string;
  action: CustodyAction;
  actor: string;
  actor_id: string;
  timestamp: string;
  event_hash: string;
  prev_event_hash: string | null;
}

export interface VerifyResult {
  evidence_id: string;
  original_hash: string;
  current_hash: string;
  integrity_intact: boolean;
  current_file_name?: string;
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

export interface SystemComponent {
  id: string;
  label: string;
  status: "operational" | "degraded" | "offline";
  note?: string;
}

export interface DashboardStats {
  total: number;
  verified: number;
  compromised: number;
  custodyEvents: number;
}

export type UploadStage = "uploading" | "hashing" | "securing" | "custody" | "complete";

export type VerifyStage = "reading" | "hashing" | "comparing" | "chain" | "result";

export interface ApiErrorPayload {
  detail?: string;
  message?: string;
}