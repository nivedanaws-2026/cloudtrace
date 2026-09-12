import type {
  CustodyEvent,
  CustodyAction,
  EvidenceRecord,
  SystemComponent,
  UserRecord,
  VerifyResult,
} from "./types";

const hex = (seed: number, len = 64): string => {
  const chars = "0123456789abcdef";
  const state = { v: seed };
  let out = "";
  for (let i = 0; i < len; i += 1) {
    state.v = (state.v * 9301 + 49297) % 233280;
    out += chars[Math.floor((state.v / 233280) * 16)];
  }
  return out;
};

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-09-13T12:00:00Z").getTime();

export const DEMO_EVIDENCE: EvidenceRecord[] = [
  {
    id: "7f3c9a2e-41d8-4f6e-9b5a-1c2d3e4f5a67",
    filename: "incident_scene_photos.zip",
    fileType: "application/zip",
    fileSize: 48_234_112,
    sha256_hash: hex(11),
    uploadedBy: "Alex Chen",
    uploadedByName: "Alex Chen",
    uploaded_at: new Date(now - 1 * DAY).toISOString(),
    status: "intact",
    source: "demo",
  },
  {
    id: "9b12e7f0-23a8-4b9c-8d1e-5f0a6b7c8d9e",
    filename: "camera_footage_master.mov",
    fileType: "video/quicktime",
    fileSize: 1_203_456_000,
    sha256_hash: hex(22),
    uploadedBy: "Sam Kim",
    uploadedByName: "Sam Kim",
    uploaded_at: new Date(now - 2 * DAY).toISOString(),
    status: "intact",
    source: "demo",
  },
  {
    id: "3a81c4d0-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
    filename: "chat_logs_export.json",
    fileType: "application/json",
    fileSize: 1_456_220,
    sha256_hash: hex(33),
    uploadedBy: "Alex Chen",
    uploadedByName: "Alex Chen",
    uploaded_at: new Date(now - 3 * DAY).toISOString(),
    status: "intact",
    source: "demo",
  },
  {
    id: "5f0a93b1-7c8d-49e5-b6a7-8f9a1b2c3d4e",
    filename: "device_forensics.img",
    fileType: "application/octet-stream",
    fileSize: 8_643_000_000,
    sha256_hash: hex(44),
    uploadedBy: "Sam Kim",
    uploadedByName: "Sam Kim",
    uploaded_at: new Date(now - 5 * DAY).toISOString(),
    status: "intact",
    source: "demo",
  },
  {
    id: "2c9e51f7-0a1b-4c3d-8e5f-6a7b8c9d0e1f",
    filename: "email_thread_evidence.eml",
    fileType: "message/rfc822",
    fileSize: 320_400,
    sha256_hash: hex(55),
    uploadedBy: "Maria Lopez",
    uploadedByName: "Maria Lopez",
    uploaded_at: new Date(now - 6 * DAY).toISOString(),
    status: "intact",
    source: "demo",
  },
  {
    id: "8d4b6a0c-1e2f-4a3b-9c8d-7e6f5a4b3c2d",
    filename: "suspicious_document.pdf",
    fileType: "application/pdf",
    fileSize: 2_153_088,
    sha256_hash: hex(66),
    uploadedBy: "Maria Lopez",
    uploadedByName: "Maria Lopez",
    uploaded_at: new Date(now - 8 * DAY).toISOString(),
    status: "compromised",
    source: "demo",
  },
];

export const DEMO_USERS: UserRecord[] = [
  {
    id: "1a2b3c4d-0000-0000-0000-000000000001",
    email: "admin@ctrace.io",
    role: "admin",
    displayName: "Ada Okafor",
    created_at: "2026-06-01T09:00:00Z",
    lastActive: "2026-09-13T11:42:00Z",
    status: "active",
  },
  {
    id: "1a2b3c4d-0000-0000-0000-000000000002",
    email: "alex.chen@ctrace.io",
    role: "investigator",
    displayName: "Alex Chen",
    created_at: "2026-06-12T10:30:00Z",
    lastActive: "2026-09-13T10:15:00Z",
    status: "active",
  },
  {
    id: "1a2b3c4d-0000-0000-0000-000000000003",
    email: "sam.kim@ctrace.io",
    role: "investigator",
    displayName: "Sam Kim",
    created_at: "2026-06-15T14:00:00Z",
    lastActive: "2026-09-12T16:40:00Z",
    status: "active",
  },
  {
    id: "1a2b3c4d-0000-0000-0000-000000000004",
    email: "maria.lopez@ctrace.io",
    role: "custodian",
    displayName: "Maria Lopez",
    created_at: "2026-07-02T08:20:00Z",
    lastActive: "2026-09-13T09:05:00Z",
    status: "active",
  },
  {
    id: "1a2b3c4d-0000-0000-0000-000000000005",
    email: "raj.patel@ctrace.io",
    role: "auditor",
    displayName: "Raj Patel",
    created_at: "2026-07-19T12:00:00Z",
    lastActive: "2026-09-13T09:20:00Z",
    status: "active",
  },
  {
    id: "1a2b3c4d-0000-0000-0000-000000000006",
    email: "old.staff@ctrace.io",
    role: "investigator",
    displayName: "Old Staff",
    created_at: "2026-06-02T09:00:00Z",
    lastActive: "2026-08-20T09:00:00Z",
    status: "suspended",
  },
];

const CHAIN_HASHES = ["92ac7f31e4b01c82d5f39a04b6e1c7d5f29a04b6e1c7d5f39a04b6e1c7d5abf",
  "e7d0c5a21b9f3e64d8a15c0b7f9e4d28a15c0b7f9e4d28a15c0b7f9e4d28c1de",
  "5fa3c9d7e1b04a26c8f3d95b7e21a04c8f3d95b7e21a04c8f3d95b7e21a04d2ef",
  "ab7e3d5f1c9b4a80d6e2f7c3a9b1d4e6f7c3a9b1d4e6f7c3a9b1d4e6f7c3ab90",
  "c41a6b8d3f5e79b2c6d1a4e8f3b5c7d9e4f3b5c7d9e4f3b5c7d9e4f3b5c7da1"].map(
    (h) => h.padEnd(64, "0"),
  );

const TS = (offsetMs: number) => new Date(now - offsetMs).toISOString();

const mkEvent = (
  i: number,
  action: CustodyAction,
  actor: string,
  offsetMs: number,
): CustodyEvent => ({
  id: `evt-${i}`,
  action,
  actor,
  actor_id: `actor-${actor.split(" ")[0].toLowerCase()}`,
  timestamp: TS(offsetMs),
  event_hash: CHAIN_HASHES[i % CHAIN_HASHES.length],
  prev_event_hash: i === 0 ? null : CHAIN_HASHES[(i - 1) % CHAIN_HASHES.length],
});

export function demoCustodyChain(evidenceId: string): CustodyEvent[] {
  void evidenceId;
  return [
    mkEvent(0, "upload", "Alex Chen", 1 * DAY + 30 * 60 * 1000),
    mkEvent(1, "access", "Maria Lopez", 20 * 60 * 60 * 1000),
    mkEvent(2, "transfer", "Maria Lopez", 10 * 60 * 60 * 1000),
    mkEvent(3, "verify", "Raj Patel", 2 * 60 * 60 * 1000),
    mkEvent(4, "verify", "Raj Patel", 30 * 60 * 1000),
  ];
}

export function demoStats(evidence: EvidenceRecord[]): {
  total: number;
  verified: number;
  compromised: number;
  custodyEvents: number;
} {
  const compromised = evidence.filter((e) => e.status === "compromised").length;
  return {
    total: evidence.length,
    verified: evidence.length - compromised,
    compromised,
    custodyEvents: 42,
  };
}

export function demoSystemComponents(
  health: { status: string } | null,
): SystemComponent[] {
  const apiOk = health?.status === "ok";
  return [
    {
      id: "api",
      label: "API",
      status: apiOk ? "operational" : "offline",
      note: apiOk ? "FastAPI responding" : "Backend unreachable",
    },
    {
      id: "db",
      label: "Database",
      status: "operational",
      note: "Amazon RDS · PostgreSQL",
    },
    {
      id: "storage",
      label: "Storage",
      status: "operational",
      note: "AWS S3 bucket",
    },
    {
      id: "auth",
      label: "Authentication",
      status: "operational",
      note: "JWT · RS256 token issuance",
    },
  ];
}

export function demoVerifyResult(evidence: EvidenceRecord): VerifyResult {
  const flip = evidence.status === "compromised" ? hex(777) : evidence.sha256_hash;
  return {
    evidence_id: evidence.id,
    original_hash: evidence.sha256_hash,
    current_hash: flip,
    integrity_intact: evidence.status === "intact",
    current_file_name: evidence.filename,
  };
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}