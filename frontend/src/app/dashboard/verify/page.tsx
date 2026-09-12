"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ScanSearch, FileStack, ChevronDown } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { loadEvidenceList, loadVerifyEvidence } from "@/lib/evidence-service";
import { VerificationPanel } from "@/components/dashboard/VerificationPanel";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { wait } from "@/lib/demo-data";
import type { EvidenceRecord, VerifyResult } from "@/lib/types";

function VerifyContent() {
  const search = useSearchParams();
  const toast = useToast();

  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>("");
  const [state, setState] = useState<"idle" | "running" | "success" | "failure">("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { records: data } = await loadEvidenceList();
        if (!mounted) return;
        setRecords(data);
        const preset = search.get("evidence");
        if (preset && data.some((r) => r.id === preset)) {
          setSelectedId(preset);
        } else if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch {
        if (mounted) toast.error("Could not load evidence");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [search, toast]);

  const selected = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId],
  );

  const runVerification = useCallback(async () => {
    if (!selected || state === "running") return;
    setState("running");
    setResult(null);

    // Drive the animated steps with real pacing.
    await wait(900);
    await wait(800);
    await wait(700);

    try {
      const { result: res } = await loadVerifyEvidence(selected);
      if (res.integrity_intact) {
        setResult(res);
        setState("success");
        toast.success("Integrity verified", "The evidence matches its fingerprint.");
      } else {
        setResult(res);
        setState("failure");
        toast.warning("Integrity compromised", "Fingerprint mismatch detected.");
      }
    } catch {
      toast.error("Verification failed", "The backend could not verify this evidence.");
      setState("idle");
    }
  }, [selected, state, toast]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Verify Evidence Integrity
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Recalculate the fingerprint and compare it against the stored value.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Select Evidence
          </p>
          {loading ? (
            <Skeleton className="h-12 w-full" />
          ) : records.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No evidence available to verify.
            </p>
          ) : (
            <>
              <div className="relative">
                <FileStack className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setState("idle");
                    setResult(null);
                  }}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-ink-900/70 py-3 pl-10 pr-10 text-sm text-slate-100 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                >
                  {records.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.filename} — {r.status === "intact" ? "intact" : "suspected modified"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>

              {selected && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-ink-900/40 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Fingerprint
                    </p>
                    <p className="truncate font-mono text-[11px] text-cyan-200/80">
                      {selected.sha256_hash.slice(0, 12)}
                      …{selected.sha256_hash.slice(-6)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      selected.status === "intact"
                        ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                        : "border-rose-400/25 bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {selected.status === "intact" ? "Intact" : "Compromised"}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <Button
                  onClick={runVerification}
                  loading={state === "running"}
                  disabled={!selected}
                  icon={state !== "running" ? <ScanSearch className="h-4 w-4" /> : undefined}
                >
                  Verify Integrity
                </Button>
              </div>
            </>
          )}
        </motion.div>

        <VerificationPanel
          state={state}
          result={result}
          evidenceName={selected?.filename}
        />
      </div>
    </PageTransition>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}