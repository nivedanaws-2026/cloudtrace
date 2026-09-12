"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

type Accent = "cyan" | "emerald" | "rose" | "violet";

const ACCENTS: Record<Accent, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = "cyan",
  suffix,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent?: Accent;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass card-hover rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${ACCENTS[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <AnimatedCounter
          value={value}
          className="font-display text-3xl font-bold tracking-tight text-slate-100"
        />
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
    </motion.div>
  );
}