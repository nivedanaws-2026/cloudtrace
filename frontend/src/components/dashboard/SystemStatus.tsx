"use client";

import { motion } from "framer-motion";
import type { SystemComponent } from "@/lib/types";

const DOT: Record<SystemComponent["status"], string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  offline: "bg-rose-400",
};

const TEXT: Record<SystemComponent["status"], string> = {
  operational: "text-emerald-300",
  degraded: "text-amber-300",
  offline: "text-rose-300",
};

const LABEL: Record<SystemComponent["status"], string> = {
  operational: "Operational",
  degraded: "Degraded",
  offline: "Offline",
};

export default function SystemStatus({
  components,
}: {
  components: SystemComponent[];
}) {
  return (
    <div className="space-y-2.5">
      {components.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-ink-900/50 px-3.5 py-2.5"
        >
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-200">{c.label}</p>
            <p className="truncate text-[11px] text-slate-500">{c.note}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {c.status === "operational" && (
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-50" />
              )}
              <span className={`relative h-2 w-2 rounded-full ${DOT[c.status]}`} />
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${TEXT[c.status]}`}>
              {LABEL[c.status]}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}