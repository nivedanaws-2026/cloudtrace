"use client";

import { motion } from "framer-motion";
import { Check, Loader2, Circle } from "lucide-react";

export default function ProcessSteps({
  stages,
  activeIndex,
  tone = "cyan",
  compact = false,
}: {
  stages: string[];
  activeIndex: number;
  tone?: "cyan" | "emerald" | "rose";
  compact?: boolean;
}) {
  const activeColor =
    tone === "emerald"
      ? "text-emerald-300 border-emerald-400/30"
      : tone === "rose"
        ? "text-rose-300 border-rose-400/30"
        : "text-cyan-300 border-cyan-400/30";

  const lineColor =
    tone === "emerald"
      ? "bg-emerald-400/60"
      : tone === "rose"
        ? "bg-rose-400/60"
        : "bg-cyan-400/60";

  return (
    <div className={`flex flex-col ${compact ? "gap-1" : "gap-2"}`}>
      {stages.map((stage, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const pending = i > activeIndex;
        return (
          <div key={stage} className="flex flex-col items-stretch">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors duration-300 ${
                active
                  ? `${activeColor} bg-white/[0.03]`
                  : done
                    ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                    : "border-white/[0.06] bg-ink-900/40"
              } ${pending ? "opacity-50" : "opacity-100"}`}
            >
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                {active && (
                  <span
                    className={`absolute inset-0 rounded-full border animate-pulse-ring ${activeColor.split(" ")[1]}`}
                  />
                )}
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </motion.span>
                ) : active ? (
                  <motion.span
                    animate={{ rotate: 0 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-current bg-white/[0.03]"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </motion.span>
                ) : (
                  <Circle className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  done
                    ? "text-emerald-200"
                    : active
                      ? "text-slate-100"
                      : "text-slate-500"
                }`}
              >
                {stage}
              </span>
              {done && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                  Done
                </span>
              )}
              {active && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-current">
                  {tone === "rose" ? "Attention" : "Processing"}
                </span>
              )}
            </motion.div>

            {i < stages.length - 1 && (
              <div className={`mx-auto h-5 w-px ${pending ? "bg-white/[0.06]" : lineColor}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}