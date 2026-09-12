import { ApiError, EvidenceApi, NotImplementedEndpointError } from "./api";
import { DEMO_EVIDENCE, demoCustodyChain, demoVerifyResult } from "./demo-data";
import type {
  CustodyEvent,
  EvidenceRecord,
  VerifyResult,
} from "./types";

export interface EvidenceListResult {
  records: EvidenceRecord[];
  fromDemo: boolean;
}

/**
 * Tries the live backend first. The GET /evidence endpoint is not implemented
 * yet, so it falls back to realistic demo data that the UI is fully wired to.
 * Once the backend supports GET /evidence, the fallback is no longer used.
 */
export async function loadEvidenceList(): Promise<EvidenceListResult> {
  try {
    const records = await EvidenceApi.list();
    if (records.length === 0) throw new NotImplementedEndpointError();
    return { records, fromDemo: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return { records: DEMO_EVIDENCE, fromDemo: true };
  }
}

export interface CustodyChainResult {
  events: CustodyEvent[];
  fromDemo: boolean;
}

export async function loadCustodyChain(
  evidenceId: string,
): Promise<CustodyChainResult> {
  try {
    const events = await EvidenceApi.custodyChain(evidenceId);
    if (events.length === 0) throw new NotImplementedEndpointError();
    return { events, fromDemo: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return { events: demoCustodyChain(evidenceId), fromDemo: true };
  }
}

export async function loadVerifyEvidence(
  evidence: EvidenceRecord,
): Promise<{ result: VerifyResult; fromDemo: boolean }> {
  try {
    const result = await EvidenceApi.verify(evidence.id);
    return { result, fromDemo: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return { result: demoVerifyResult(evidence), fromDemo: true };
  }
}

export function findDemoEvidence(id: string): EvidenceRecord | undefined {
  return DEMO_EVIDENCE.find((e) => e.id === id);
}