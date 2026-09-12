"use client";

import { motion } from "framer-motion";
import { FileText, FileWarning, ArrowDown, Equal, ShieldX } from "lucide-react";
import { Reveal } from "@/components/ui/Motion";

const ORIGINAL = "a94f5d1c7b3e2f809a6b4c1d5e2f3a94b7c1d5e2f3a94b7c1d5e2f3a94b92bc";
const MODIFIED = "f21a7c5d3b9e1f647a0f3c9d2e8b5a1f7c0d9e4b2a8f3c6d1e5b7a9f473de";

function HashReveal({
  hash,
  highlights,
  delay = 0,
}: {
  hash: string;
  highlights?: Set<number>;
  delay?: number;
}) {
  return (
    <div className="w-full break-all font-mono text-[13px] leading-relaxed tracking-wide">
      {Array.from(hash).map((ch, i) => {
        const diff = highlights?.has(i);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, color: "#1e293b" }}
            whileInView={{ opacity: 1, color: diff ? "#fda4af" : "#7dd3fc" }}
            viewport={{ once: true }}
            transition={{ duration: 0.12, delay: delay + i * 0.012 }}
            className={diff ? "bg-rose-400/15 px-px" : ""}
          >
            {ch}
          </motion.span>
        );
      })}
    </div>
  );
}

function diffSet(a: string, b: string): Set<number> {
  const set = new Set<number>();
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) set.add(i);
  }
  return set;
}

export default function TrustEveryByte() {
  const diff = diffSet(ORIGINAL, MODIFIED);

  return (
    <section className="relative py-24 sm:py-32" id="trust">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Cryptographic Proof
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trust <span className="text-gradient">Every Byte</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Even a single changed byte produces a different cryptographic
            fingerprint.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Original */}
          <Reveal delay={0.05}>
            <div className="h-full rounded-2xl border border-emerald-400/15 bg-ink-800/50 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Original Evidence
                  </p>
                  <p className="text-xs text-slate-500">ingest_original.bin</p>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-3 pt-4">
                <ArrowDown className="h-4 w-4 text-slate-600" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  SHA-256
                </span>
              </div>

              <div className="mt-2 rounded-lg border border-white/[0.06] bg-ink-950/80 px-4 py-3.5">
                <HashReveal hash={ORIGINAL} delay={0.2} />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <Equal className="h-3.5 w-3.5" />
                Fingerprint matches
              </div>
            </div>
          </Reveal>

          {/* Modified */}
          <Reveal delay={0.15}>
            <div className="h-full rounded-2xl border border-rose-400/20 bg-ink-800/50 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/25 bg-rose-400/10 text-rose-300">
                  <FileWarning className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Modified Evidence
                  </p>
                  <p className="text-xs text-slate-500">ingest_modified.bin</p>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-center gap-3 pt-4">
                <ArrowDown className="h-4 w-4 text-slate-600" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  SHA-256
                </span>
              </div>

              <div className="mt-2 rounded-lg border border-rose-400/15 bg-ink-950/80 px-4 py-3.5">
                <HashReveal hash={MODIFIED} highlights={diff} delay={0.4} />
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-300"
              >
                <ShieldX className="h-3.5 w-3.5" />
                Integrity Compromised
              </motion.div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mx-auto mt-8 max-w-4xl">
          <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-ink-800/40 px-5 py-4">
            <span className="mt-0.5 font-mono text-[10px] font-bold text-slate-500">
              {diff.size}
            </span>
            <p className="text-sm leading-relaxed text-slate-400">
              A single perturbed byte produced <strong className="text-slate-200">{diff.size}</strong>{" "}
              different hash characters. CloudTrace flips the evidence record to{" "}
              <span className="font-semibold text-rose-300">
                INTEGRITY COMPROMISED
              </span>{" "}
              the moment the fingerprints stop matching.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}