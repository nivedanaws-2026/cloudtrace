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
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import UploadZone from "@/components/dashboard/UploadZone";
import ProcessSteps from "@/components/dashboard/ProcessSteps";
import Button from "@/components/ui/Button";
import HashBox from "@/components/ui/HashBox";
import { PageTransition } from "@/components/ui/Motion";
import { EvidenceApi, uploadClientHash, ApiError } from "@/lib/api";
import { wait } from "@/lib/demo-data";
import type { EvidenceUploadResponse, UploadStage } from "@/lib/types";

const STAGES: { key: UploadStage; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "hashing", label: "Calculating SHA-256" },
  { key: "securing", label: "Securing Evidence" },
  { key: "custody", label: "Creating Custody Event" },
  { key: "complete", label: "Complete" },
];

export default function UploadPage() {
  const toast = useToast();

  const [phase, setPhase] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number } | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
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
      setEvidenceId(null);
      setDemoMode(false);
      setProgress(0);
      setHash(null);
      setPhase("processing");
      setStageIndex(1);

      // Client-side SHA-256 of the exact bytes — always real, shown to the user.
      let localHash: string | null = null;
      try {
        const buffer = await file.arrayBuffer();
        localHash = await uploadClientHash(buffer);
        setHash(localHash);
      } catch {
        localHash = null;
      }

      // Try the real upload endpoint (with progress).
      let uploaded: EvidenceUploadResponse | null = null;
      try {
        uploaded = await EvidenceApi.upload(file, (pct) => setProgress(pct));
        setEvidenceId(uploaded.evidence_id);
        setHash(uploaded.sha256_hash);
      } catch (err) {
        if (err instanceof ApiError && err.status !== 0) {
          setPhase("error");
          toast.error("Upload failed", err.message);
          return;
        }
        // Network/unreachable backend → clean demo fallback.
        setDemoMode(true);
        toast.info("Demo mode", "Backend unreachable — processing simulated locally.");
      }

      if (cancelled.current) return;

      setStageIndex(2);
      await wait(700);
      if (cancelled.current) return;

      setStageIndex(3);
      await wait(700);
      if (cancelled.current) return;

      setStageIndex(4);
      await wait(350);
      if (cancelled.current) return;

      setPhase("success");
      toast.success(
        "Evidence secured",
        uploaded
          ? "Stored with a cryptographic fingerprint and custody event."
          : "Local pipeline complete — no server involved.",
      );
    },
    [phase, toast],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setStageIndex(0);
    setProgress(0);
    setFileMeta(null);
    setHash(null);
    setEvidenceId(null);
    setDemoMode(false);
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Upload Evidence
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Securely upload a file. CloudTrace fingerprints it and opens a
            custody chain.
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
                Processing {fileMeta?.name}
              </p>
              <ProcessSteps
                stages={STAGES.map((s) => s.label)}
                activeIndex={stageIndex}
                tone="cyan"
              />
            </motion.div>
          )}

          {phase === "success" && hash && (
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
                  {fileMeta?.name} has been fingerprinted and logged.
                </p>
                {demoMode && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                    <Fingerprint className="h-3 w-3" />
                    Demo mode — backend offline
                  </p>
                )}
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <Fingerprint className="h-3.5 w-3.5 text-cyan-300" />
                    SHA-256 Fingerprint
                  </p>
                  <HashBox hash={hash} />
                </div>

                <p className="flex items-center gap-1.5 px-1 text-[11px] text-slate-500">
                  {demoMode
                    ? "This fingerprint reflects the exact bytes you selected."
                    : "Fingerprint stored with the evidence record in CloudTrace."}
                </p>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
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
                  {evidenceId && (
                    <Link href={`/dashboard/evidence/${evidenceId}`}>
                      <Button icon={<ArrowRight className="h-4 w-4" />}>
                        View Evidence
                      </Button>
                    </Link>
                  )}
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
              <p className="mt-1 text-sm text-slate-400">
                The backend could not process the upload. Check that the API is
                running and CORS is configured, then try again.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button variant="outline" onClick={reset}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}