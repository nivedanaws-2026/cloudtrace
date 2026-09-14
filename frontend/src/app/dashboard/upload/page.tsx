"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Check,
  BadgeCheck,
  Fingerprint,
  CloudOff,
  Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import RoleGuard from "@/components/layout/RoleGuard";
import UploadZone from "@/components/dashboard/UploadZone";
import ProcessSteps from "@/components/dashboard/ProcessSteps";
import Button from "@/components/ui/Button";
import HashBox from "@/components/ui/HashBox";
import { PageTransition } from "@/components/ui/Motion";
import { EvidenceApi, ApiError } from "@/lib/api";
import { addSessionUpload } from "@/lib/evidence-service";
import { formatBytes } from "@/lib/format";
import type { EvidenceUploadResponse, UploadStage } from "@/lib/types";

const STAGES: { key: UploadStage; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "hashing", label: "Calculating SHA-256" },
  { key: "securing", label: "Securing Evidence" },
  { key: "custody", label: "Creating Custody Event" },
];

export default function UploadPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [phase, setPhase] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<EvidenceUploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  const copyHash = useCallback(async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [hash]);

  const handleFile = useCallback(
    async (file: File) => {
      if (phase === "processing") return;
      cancelled.current = false;

      setFileMeta({ name: file.name, size: file.size });
      setUploaded(null);
      setErrorMessage(null);
      setProgress(0);
      setHash(null);
      setPhase("processing");
      setStageIndex(1);

      let serverResult: EvidenceUploadResponse | null = null;

      try {
        serverResult = await EvidenceApi.upload(file, (pct) => setProgress(pct));
        setStageIndex(2);
        setHash(serverResult.sha256_hash);
        setUploaded(serverResult);
      } catch (err) {
        if (cancelled.current) return;
        if (err instanceof ApiError) {
          setErrorMessage(err.detail ?? err.message);
        } else {
          setErrorMessage("Something went wrong during the upload.");
        }
        setPhase("error");
        return;
      }

      if (cancelled.current) return;
      setStageIndex(3);
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled.current) return;

      setPhase("success");
      if (serverResult) {
        addSessionUpload({
          evidence_id: serverResult.evidence_id,
          filename: serverResult.filename,
          sha256_hash: serverResult.sha256_hash,
        });
      }
      toast.success("Evidence secured", "Stored with a cryptographic fingerprint and custody event.");
    },
    [phase, toast],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setStageIndex(0);
    setProgress(0);
    setFileMeta(null);
    setHash(null);
    setUploaded(null);
    setErrorMessage(null);
  }, []);

  return (
    <RoleGuard allow={["investigator", "custodian"]}>
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Upload Evidence
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Securely upload a file. CloudTrace fingerprints it with SHA-256 and
              opens a tamper-evident custody chain.
            </p>
          </div>

          <UploadZone
            onFile={handleFile}
            busy={phase === "processing"}
            progress={progress}
          />

          <AnimatePresence mode="wait">
            {phase === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="glass rounded-2xl p-5"
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Securing {fileMeta?.name}
                </p>
                <ProcessSteps
                  stages={STAGES.map((s) => s.label)}
                  activeIndex={stageIndex}
                  tone="cyan"
                />
              </motion.div>
            )}

            {phase === "success" && uploaded && hash && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass-strong overflow-hidden rounded-2xl"
              >
                <div className="border-b border-emerald-400/15 bg-emerald-400/[0.05] px-6 py-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 shadow-glow-sm"
                  >
                    <BadgeCheck className="h-8 w-8" />
                  </motion.div>
                  <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-emerald-300">
                    EVIDENCE SECURED
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-400">
                    {uploaded.filename} has been fingerprinted and logged.
                  </p>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      <Fingerprint className="h-3.5 w-3.5 text-cyan-300" />
                      SHA-256 Fingerprint
                    </p>
                    <HashBox hash={hash} />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-ink-900/60 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Evidence ID
                      </p>
                      <p className="mt-1 truncate font-mono text-sm text-cyan-200">
                        {uploaded.evidence_id}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Size
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {formatBytes(fileMeta?.size ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={copyHash}
                      icon={
                        copied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )
                      }
                    >
                      {copied ? "Copied" : "Copy Fingerprint"}
                    </Button>
                    <Link href={`/dashboard/evidence/${uploaded.evidence_id}`}>
                      <Button icon={<ArrowRight className="h-4 w-4" />}>
                        View Evidence & Chain
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={reset}>
                      Upload Another
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-rose-400/25 p-6 text-center"
              >
                <CloudOff className="mx-auto h-10 w-10 text-rose-300" />
                <p className="mt-3 font-display text-lg font-semibold text-rose-200">
                  Upload failed
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
                  {errorMessage ??
                    "The backend could not process the upload. Check that the API is running and CORS is configured."}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button variant="outline" onClick={reset}>
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {user && (
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <Save className="h-3 w-3" />
              Records stay linked to your account ({user.email}) and appear on
              your My Evidence page.
            </p>
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}