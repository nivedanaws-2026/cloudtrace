"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Copy,
  FileUp,
  Eye,
  ArrowLeftRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Trash2,
  Link2,
  Fingerprint,
} from "lucide-react";
import type { CustodyAction, CustodyEvent } from "@/lib/types";
import { formatDateTime, formatRelative } from "@/lib/format";

const ACTION_META: Record<
  CustodyAction,
  { label: string; icon: LucideIcon; color: string }
> = {
  upload: {
    label: "Evidence Uploaded",
    icon: FileUp,
    color: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  },
  access: {
    label: "Custody Event",
    icon: Eye,
    color: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  },
  transfer: {
    label: "Custody Transfer",
    icon: ArrowLeftRight,
    color: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  },
  verify: {
    label: "Integrity Verified",
    icon: ShieldCheck,
    color: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  verify_mismatch: {
    label: "Integrity Compromised",
    icon: ShieldAlert,
    color: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  },
  seal: {
    label: "Evidence Sealed",
    icon: Lock,
    color: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  },
  release: {
    label: "Evidence Released",
    icon: Unlock,
    color: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  },
  destroy: {
    label: "Evidence Destroyed",
    icon: Trash2,
    color: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  },
};

function MiniHash({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-white/[0.04] bg-ink-950/50 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </span>
        <span className="font-mono text-[11px] italic text-slate-600">genesis · null</span>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* older browsers */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-white/[0.05] bg-ink-950/50 px-2.5 py-1.5">
      <div className="min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {label}
        </span>
        <p className="truncate font-mono text-[11px] text-cyan-200/80">
          {value.slice(0, 20)}…{value.slice(-6)}
        </p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 rounded p-1 text-slate-600 transition hover:text-cyan-300"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}

export default function CustodyTimeline({
  events,
  fromDemo,
}: {
  events: CustodyEvent[];
  fromDemo: boolean;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 py-14 text-center">
        <p className="text-sm text-slate-400">No custody events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-4 left-[19px] top-4 w-px bg-white/[0.07]" />

      {fromDemo && (
        <p className="mb-4 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-[11px] text-amber-200/90">
          Showing a demo custody chain — connect{" "}
          <code className="font-mono">GET /evidence/&#123;id&#125;/custody-chain</code> for the live
          ledger.
        </p>
      )}

      <div className="space-y-8">
        {events.map((event, i) => {
          const meta = ACTION_META[event.action] ?? ACTION_META.access;
          const Icon = meta.icon;
          const isGenesis = i === 0;
          return (
            <motion.div
              key={event.id ?? i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex gap-5"
            >
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-ink-800">
                <span
                  className={`absolute inset-0 rounded-full border animate-pulse-ring ${meta.color.split(" ")[1]}`}
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
                <Icon className={`h-4 w-4 ${meta.color.split(" ")[2]}`} />
              </div>

              <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-ink-900/50 p-4 transition-colors duration-300 hover:border-cyan-400/20">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`font-display text-sm font-semibold ${meta.color.split(" ")[2]}`}>
                    {meta.label}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDateTime(event.timestamp)} ·{" "}
                    <span className="text-slate-400">{formatRelative(event.timestamp)}</span>
                  </p>
                </div>

                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wide text-slate-300">
                    Actor
                  </span>
                  <span className="h-3 w-px bg-white/10" />
                  {event.actor}
                  <span className="font-mono text-[10px] text-slate-600">
                    ({event.actor_id.slice(0, 8)})
                  </span>
                </p>

                <div className="mt-3 space-y-2">
                  {!isGenesis && (
                    <MiniHash label="Previous Event Hash" value={event.prev_event_hash} />
                  )}
                  <MiniHash label="Event Hash" value={event.event_hash} />
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  <Link2 className="h-3 w-3" />
                  {isGenesis
                    ? "Genesis event — anchors the chain"
                    : "Cryptographically linked to previous event"}
                  {isGenesis && <Fingerprint className="ml-1 h-3 w-3" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 ml-[26px] mt-8 inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-semibold tracking-wide text-emerald-300">
          {events.length} events → chain end · tamper-evident
        </span>
      </motion.div>
    </div>
  );
}