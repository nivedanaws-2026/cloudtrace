import type { EvidenceRecord, SystemComponent } from "./types";

export function demoStats(evidence: EvidenceRecord[]): {
  total: number;
  verified: number;
  compromised: number;
  custodyEvents: number;
} {
  const compromised = evidence.filter((e) => e.status === "mismatch").length;
  return {
    total: evidence.length,
    verified: evidence.filter((e) => e.status === "intact").length,
    compromised,
    custodyEvents: evidence.length * 2 + 1,
  };
}

export function demoSystemComponents(
  health: { status: string; database?: string; storage?: string } | null,
): SystemComponent[] {
  const apiOk = health?.status === "ok";
  const dbOk = apiOk && health?.database === "ok";
  const storageOk = apiOk && health?.storage === "ok";
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
      status: dbOk ? "operational" : apiOk ? "degraded" : "offline",
      note: "PostgreSQL",
    },
    {
      id: "storage",
      label: "Storage",
      status: storageOk ? "operational" : apiOk ? "degraded" : "offline",
      note: "Evidence store",
    },
    {
      id: "auth",
      label: "Authentication",
      status: apiOk ? "operational" : "offline",
      note: "JWT · HS256 token issuance",
    },
  ];
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}