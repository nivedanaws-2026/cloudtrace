"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CloudCog,
  FileSearch,
  Fingerprint,
  Link2,
  ScanSearch,
} from "lucide-react";

export interface Stage {
  key: string;
  label: string;
  sub?: string;
  icon: LucideIcon;
}

export const HERO_STAGES: Stage[] = [
  { key: "evidence", label: "Digital Evidence", sub: "File ingested", icon: FileSearch },
  { key: "hash", label: "SHA-256", sub: "Fingerprint calculated", icon: Fingerprint },
  { key: "storage", label: "Secure Storage", sub: "AWS S3 + RDS", icon: CloudCog },
  { key: "custody", label: "Chain of Custody", sub: "Every action linked", icon: Link2 },
  { key: "verify", label: "Verification", sub: "Integrity confirmed", icon: ScanSearch },
];

export function FlowConnector({
  height = 44,
  delay = 0,
  duration = 1.6,
}: {
  height?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <div
      className="relative mx-auto w-px overflow-visible"
      style={{ height }}
      aria-hidden
    >
      <div className="flow-v absolute left-0 top-0 h-full w-full opacity-80" />
      <motion.span
        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-glow-sm"
        animate={{ y: [-6, height + 6] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          repeatDelay: 0.4,
        }}
      />
    </div>
  );
}

export function StageNode({
  stage,
  index,
}: {
  stage: Stage;
  index: number;
}) {
  const Icon = stage.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-ink-800/70 px-3.5 py-2.5 backdrop-blur-xl"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 text-cyan-300">
        <Icon className="h-5 w-5" />
        <span
          className="absolute inset-0 rounded-lg border border-cyan-400/25 animate-pulse-ring"
          style={{ animationDelay: `${index * 0.5}s` }}
        />
      </div>
      <div className="min-w-0">
        <p className="font-display text-[13px] font-semibold tracking-wide text-slate-100">
          {stage.label}
        </p>
        {stage.sub && (
          <p className="truncate text-[11px] text-slate-500">{stage.sub}</p>
        )}
      </div>
      {index === 0 && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5"
        >
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
            Ingested
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PipelineVisual({
  stages = HERO_STAGES,
}: {
  stages?: Stage[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
    >
      <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10 blur-2xl" />

      <div className="relative rounded-2xl glass-strong p-5">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Evidence Pipeline
            </p>
          </div>
          <p className="font-mono text-[10px] text-slate-600">LIVE · SECURED</p>
        </div>

        <div className="space-y-0">
          {stages.map((stage, i) => (
            <div key={stage.key} className="flex flex-col items-stretch">
              <StageNode stage={stage} index={i} />
              {i < stages.length - 1 && (
                <FlowConnector height={40} delay={i * 0.4} />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}