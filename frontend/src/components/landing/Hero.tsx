"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import PipelineVisual from "@/components/landing/PipelineVisual";
import ParticleField from "@/components/landing/ParticleField";
import CloudNodes from "@/components/landing/CloudNodes";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-28">
      <div className="absolute inset-0 bg-grid bg-grid-fade" />
      <div className="absolute left-1/2 top-1/2 h-[560px] w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-600/15 via-blue-700/8 to-cyan-500/12 blur-[120px]" />
      <ParticleField />
      <CloudNodes />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span className="text-xs font-medium tracking-wide text-cyan-200">
              Cloud-Native Forensic Integrity Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="text-glow">CLOUD</span>
            <span className="text-gradient text-glow">TRACE</span>
            <span className="mt-3 block text-2xl font-semibold leading-snug text-slate-300 sm:text-3xl">
              Digital Evidence Integrity,{" "}
              <span className="text-cyan-300">Secured by Design</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Securely store, track, verify, and preserve the integrity of digital
            evidence through cryptographic hashing and an immutable chain of
            custody.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link href="#features">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Explore Platform
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              SHA-256 verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Immutable custody chain
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              AWS + Kubernetes
            </span>
          </motion.div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-md"
          >
            <PipelineVisual />
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-600 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-8 w-px bg-gradient-to-b from-cyan-400/60 to-transparent"
        />
      </div>
    </section>
  );
}