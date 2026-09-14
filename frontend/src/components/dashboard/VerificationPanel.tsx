"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  ScanSearch,
} from "lucide-react";
import type { VerifyResult } from "@/lib/types";
import ProcessSteps from "@/components/dashboard/ProcessSteps";
import HashBox from "@/components/ui/HashBox";

const VERIFY_STAGES = [
  "Reading Evidence",
  "Calculating SHA-256",
  "Comparing Fingerprints",
  "Checking Custody Chain",
];

export function VerificationPanel({
  state,
  result,
  evidenceName,
}: {
  state: "idle" | "running" | "success" | "failure";
  result: VerifyResult | null;
  evidenceName?: string;
}) {
  const stageIndex = state === "idle" ? -1 : state === "success" || state === "failure" ? VERIFY_STAGES.length : 0;

  return (
    <div className="space-y-5">
      {state !== "idle" && (
        <ProcessSteps
          stages={VERIFY_STAGES}
          activeIndex={stageIndex}
          tone={state === "failure" ? "rose" : "emerald"}
        />
      )}

      {(state === "success" || state === "failure") && result && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div
            className={`flex flex-col items-center gap-3 rounded-2xl border px-6 py-8 text-center ${
              state === "success"
                ? "border-emerald-400/25 bg-emerald-400/[0.06]"
                : "border-rose-400/30 bg-rose-400/[0.07]"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.15 }}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${
                state === "success"
                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shadow-glow-sm"
                  : "border-rose-400/30 bg-rose-400/15 text-rose-300"
              }`}
            >
              {state === "success" ? (
                <ShieldCheck className="h-8 w-8" />
              ) : (
                <ShieldAlert className="h-8 w-8" />
              )}
            </motion.div>

            <div>
              <h3
                className={`font-display text-xl font-bold tracking-tight ${
                  state === "success" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {state === "success" ? "INTEGRITY INTACT" : "MISMATCH DETECTED"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                {state === "success" ? (
                  <>
                    The evidence matches its original cryptographic fingerprint.
                    {evidenceName && (
                      <span className="text-slate-500"> ({evidenceName})</span>
                    )}
                  </>
                ) : (
                  <>
                    The current evidence does not match its original cryptographic
                    fingerprint. The file has likely been modified since it was
                    secured.
                  </>
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Stored SHA-256
            </p>
            <HashBox hash={result.original_hash} compact />
          </div>

          <div className="flex items-center gap-2 pl-1">
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                state === "success"
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                  : "border-rose-400/25 bg-rose-400/10 text-rose-300"
              }`}
            >
              {state === "success" ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {state === "success" ? "Fingerprints match" : "Fingerprints differ"}
            </span>
            {state === "failure" && (
              <span className="text-[11px] text-slate-500">
                mismatch at {countDiff(result.original_hash, result.current_hash)} characters
              </span>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Current SHA-256
            </p>
            <HashBox hash={result.current_hash} compact />
          </div>

          {state === "success" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-ink-900/50 px-3.5 py-2.5 text-xs text-slate-400"
            >
              <ScanSearch className="h-4 w-4 shrink-0 text-cyan-300" />
              Verified against the custody chain. Verified result recorded as a
              linked custodian event.
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 rounded-lg border border-rose-400/15 bg-rose-400/[0.04] px-3.5 py-2.5 text-xs text-rose-200/90"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              CloudTrace recommends quarantining this evidence and reviewing the
              custody chain for unauthorized access.
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function countDiff(a: string, b: string): number {
  const len = Math.max(a.length, b.length);
  let count = 0;
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) count += 1;
  }
  return count;
}