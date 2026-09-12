"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Fingerprint,
  Link2,
  Lock,
  ScanSearch,
  FileSearch,
  Database,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/ui/Motion";

const STAGES = [
  {
    icon: FileSearch,
    label: "Digital Evidence",
    desc: "Any file captured or collected from the field",
  },
  {
    icon: Fingerprint,
    label: "SHA-256 Hash",
    desc: "A unique 256-bit cryptographic fingerprint is derived",
  },
  {
    icon: Lock,
    label: "Cryptographic Fingerprint",
    desc: "Bound to the evidence record at the moment of ingestion",
  },
  {
    icon: Database,
    label: "Secure Storage",
    desc: "Encrypted at rest inside AWS S3 with IAM-controlled access",
  },
  {
    icon: Link2,
    label: "Chain of Custody",
    desc: "Every event is hash-linked to the previous event",
  },
  {
    icon: ScanSearch,
    label: "Verification",
    desc: "Recalculated hashes confirm nothing has changed",
  },
];

export default function EvidenceIntegrity() {
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
  });

  return (
    <section className="relative py-24 sm:py-32" id="integrity">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Evidence Integrity Pipeline
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One Flow.{" "}
            <span className="text-gradient">Unbreakable Integrity.</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Watch how evidence moves from ingestion to verification — every
            stage cryptographically linked to the one before it.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-md">
          <div className="absolute inset-y-2 left-[22px] w-px bg-white/[0.06]" />
          <motion.div
            style={{ scaleY }}
            className="absolute inset-y-2 left-[22px] w-px origin-top bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-600"
          />

          <div ref={railRef} className="relative flex flex-col gap-2">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex items-start gap-5"
                >
                  <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-ink-800 text-cyan-300 shadow-glow-sm">
                    <Icon className="h-5 w-5" />
                    <span
                      className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-pulse-ring"
                      style={{ animationDelay: `${i * 0.55}s` }}
                    />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.12 }}
                    className="glass w-full rounded-xl px-4 py-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[10px] font-bold text-slate-600">
                        0{i + 1}
                      </p>
                      <p className="font-display text-sm font-semibold tracking-wide text-slate-100">
                        {stage.label}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {stage.desc}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-sm font-semibold tracking-wide text-emerald-300">
              INTEGRITY · VERIFIED · COMPLETE
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}