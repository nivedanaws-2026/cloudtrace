"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileStack,
  ScanSearch,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  Link2,
  HardDrive,
  FileWarning,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { EvidenceApi, ApiError } from "@/lib/api";
import {
  loadCustodyChain,
  runVerification,
  getSessionUploads,
} from "@/lib/evidence-service";
import { IntegrityBadge } from "@/components/ui/Badge";
import Fingerprint from "@/components/dashboard/Fingerprint";
import HashBox from "@/components/ui/HashBox";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import CustodyTimeline from "@/components/dashboard/CustodyTimeline";
import { VerificationPanel } from "@/components/dashboard/VerificationPanel";
import { PageTransition } from "@/components/ui/Motion";
import { ErrorBanner, EmptyState } from "@/components/ui/StatePanels";
import { formatDateTime, fileExtension, formatEvidenceId } from "@/lib/format";
import type { CustodyEvent, EvidenceRecord, VerifyResult } from "@/lib/types";

export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [chain, setChain] = useState<CustodyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [verifyState, setVerifyState] = useState<
    "idle" | "running" | "success" | "failure"
  >("idle");
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const record = await EvidenceApi.get(params.id);
        if (!mounted) return;
        setEvidence(record);
        try {
          setChain(await loadCustodyChain(record.id));
        } catch {
          if (mounted) setChain([]);
        }
      } catch (err) {
        if (!mounted) return;
        if (err instanceof ApiError && err.status === 403) {
          setAccessDenied(true);
        } else if (err instanceof ApiError && err.status === 404) {
          const session = getSessionUploads().find((s) => s.evidence_id === params.id);
          if (session) {
            setEvidence({
              id: session.evidence_id,
              filename: session.filename,
              sha256_hash: session.sha256_hash,
              uploaded_by: "",
              uploaded_email: "This session",
              uploaded_at: new Date().toISOString(),
              status: "unverified",
              source: "session",
            });
          }
        } else {
          toast.error("Could not load evidence");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, toast]);

  const runVerify = useCallback(async () => {
    if (!evidence) return;
    setVerifyState("running");
    setVerifyResult(null);
    try {
      const result = await runVerification(evidence.id);
      setVerifyResult(result);
      setVerifyState(result.integrity_intact ? "success" : "failure");
      setEvidence((prev) => prev && { ...prev, status: result.integrity_intact ? "intact" : "mismatch" });
      toast.success(
        result.integrity_intact
          ? "Integrity verified"
          : "Mismatch detected",
        result.integrity_intact
          ? "The evidence matches its original fingerprint."
          : "The current file does not match its stored hash.",
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error("You don't have access to this evidence");
      } else {
        toast.error("Verification failed", err instanceof ApiError ? err.detail ?? err.message : "Please try again.");
      }
      setVerifyState("idle");
    }
  }, [evidence, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <PageTransition>
        <ErrorBanner message="You don't have access to this evidence. Only the uploading party, admins and auditors can view it." />
        <div className="mt-6">
          <EmptyState
            icon={<FileWarning className="h-5 w-5" />}
            title="Access restricted"
            message="This evidence record exists but your role cannot open it."
          />
        </div>
      </PageTransition>
    );
  }

  if (!evidence) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <HardDrive className="h-10 w-10 text-slate-600" />
          <p className="font-display text-lg font-semibold text-slate-200">
            Evidence not found
          </p>
          <p className="text-sm text-slate-500">
            No record matches ID{" "}
            <code className="font-mono text-cyan-300">{params.id}</code>.
          </p>
        </div>
      </PageTransition>
    );
  }

  const meta = [
    {
      icon: Hash,
      label: "Evidence ID",
      value: formatEvidenceId(evidence.id),
      mono: true,
    },
    {
      icon: User,
      label: "Uploaded By",
      value: evidence.uploaded_email || evidence.uploaded_by || "—",
    },
    {
      icon: Calendar,
      label: "Recorded At",
      value: formatDateTime(evidence.uploaded_at),
    },
    {
      icon: FileStack,
      label: "File Type",
      value: evidence.filename ? fileExtension(evidence.filename) : "—",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Evidence <span className="font-mono text-cyan-300">{formatEvidenceId(evidence.id)}</span>
            </p>
            <h2 className="mt-1 flex flex-wrap items-center gap-3 font-display text-xl font-bold tracking-tight text-white">
              <FileStack className="h-5 w-5 text-cyan-300" />
              {evidence.filename}
            </h2>
          </div>
          <IntegrityBadge status={evidence.status} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Hash className="h-3.5 w-3.5 text-cyan-300" />
            Cryptographic Fingerprint
          </p>
          <Fingerprint
            hash={evidence.sha256_hash}
            match={evidence.status !== "mismatch"}
          />
          <div className="mt-4">
            <HashBox
              hash={evidence.sha256_hash}
              label={`SHA-256 · ${evidence.filename ? fileExtension(evidence.filename) : "file"}`}
            />
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {meta.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-cyan-300/80" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest">
                    {m.label}
                  </p>
                </div>
                <p
                  className={`mt-1.5 truncate text-sm font-medium text-slate-100 ${
                    m.mono ? "font-mono text-cyan-200" : ""
                  }`}
                  title={m.value}
                >
                  {m.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Integrity Verification
            </p>
            <Button
              icon={<ScanSearch className="h-4 w-4" />}
              loading={verifyState === "running"}
              disabled={verifyState === "running"}
              onClick={runVerify}
            >
              Verify Now
            </Button>
          </div>
          <VerificationPanel
            state={verifyState}
            result={verifyResult}
            evidenceName={evidence.filename}
          />
          {verifyState === "idle" && (
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Re-hashes the evidence on disk and compares it against the stored
              SHA-256 fingerprint. The result is written to the custody chain as a
              linked event.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Link2 className="h-3.5 w-3.5 text-cyan-300" />
            Custody Chain
          </p>
          {chain.length > 0 ? (
            <CustodyTimeline events={chain} />
          ) : (
            <EmptyState
              icon={<Link2 className="h-5 w-5" />}
              title="No custody events yet"
              message="The chain is being built. Upload records open with a creation event."
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}