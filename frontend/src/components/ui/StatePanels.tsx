"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CloudOff, Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-ink-800/60 text-slate-600">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-slate-200">{title}</p>
        {message && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{message}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-3.5"
    >
      <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
      <div>
        <p className="text-sm font-semibold text-rose-200">Something went wrong</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{message}</p>
      </div>
    </motion.div>
  );
}

export function OfflineBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3.5">
      <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
      <div>
        <p className="text-sm font-semibold text-amber-200">Backend unreachable</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
          Showing this session&apos;s locally uploaded evidence. Start the FastAPI
          server on <code className="font-mono text-cyan-300">localhost:8000</code>{" "}
          and refresh for live data.
        </p>
      </div>
    </div>
  );
}