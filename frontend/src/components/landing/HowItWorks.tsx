"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  UploadCloud,
  Fingerprint,
  CloudCog,
  Footprints,
  ScanSearch,
  ShieldAlert,
} from "lucide-react";
import { Reveal } from "@/components/ui/Motion";

const STEPS = [
  {
    icon: UploadCloud,
    title: "Upload",
    desc: "Investigator uploads digital evidence.",
  },
  {
    icon: Fingerprint,
    title: "Fingerprint",
    desc: "CloudTrace calculates a SHA-256 hash.",
  },
  {
    icon: CloudCog,
    title: "Store",
    desc: "Evidence and metadata are securely stored.",
  },
  {
    icon: Footprints,
    title: "Track",
    desc: "Every custody action is recorded.",
  },
  {
    icon: ScanSearch,
    title: "Verify",
    desc: "The current file is hashed again and compared with the original fingerprint.",
  },
  {
    icon: ShieldAlert,
    title: "Detect",
    desc: "CloudTrace identifies whether the evidence remains intact.",
  },
];

export default function HowItWorks() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.72", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 110, damping: 24 });

  return (
    <section className="relative py-24 sm:py-32" id="how-it-works">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            The Workflow
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From Upload to <span className="text-gradient">Detection</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Six steps. Each one cryptographically anchored to the last —
            scroll to watch the process build.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-16 grid max-w-3xl gap-2">
          <div className="absolute bottom-3 left-[21px] top-3 w-px bg-white/[0.06]" />
          <motion.div
            style={{ scaleY }}
            className="absolute bottom-3 left-[21px] top-3 w-px origin-top bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600"
          />

          <div ref={lineRef}>
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-center gap-5 py-4"
                >
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-ink-800 font-mono text-xs font-bold text-cyan-300 shadow-glow-sm">
                    <span className="absolute inset-0 flex items-center justify-center text-[11px]">
                      0{i + 1}
                    </span>
                    <span className="sr-only">{step.title}</span>
                    <span className="absolute inset-0 rounded-xl border border-cyan-400/20 animate-pulse-ring" />
                    <Icon className="h-4 w-4 opacity-0" />
                  </div>

                  <div className="glass w-full rounded-xl px-5 py-4 transition-colors duration-300 hover:border-cyan-400/20">
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-display text-base font-semibold text-slate-100">
                        {step.title}
                      </h3>
                      <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 sm:block">
                        Step {i + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}