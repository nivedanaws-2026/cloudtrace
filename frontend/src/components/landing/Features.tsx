"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Fingerprint,
  Link2,
  Waves,
  Users,
  CloudCog,
  Eye,
} from "lucide-react";
import { Reveal } from "@/components/ui/Motion";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Fingerprint,
    title: "SHA-256 Integrity",
    desc: "Every uploaded evidence file receives a cryptographic fingerprint.",
  },
  {
    icon: Link2,
    title: "Chain of Custody",
    desc: "Every evidence action is recorded as a linked custody event.",
  },
  {
    icon: Waves,
    title: "Tamper Detection",
    desc: "Detect even a single-byte modification through hash verification.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Control investigator, custodian, auditor, and administrator permissions.",
  },
  {
    icon: CloudCog,
    title: "Secure Cloud Storage",
    desc: "Evidence files are designed for secure storage using AWS S3.",
  },
  {
    icon: Eye,
    title: "Audit Transparency",
    desc: "Review the complete history of evidence activity.",
  },
];

function TiltCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 220,
    damping: 20,
  });
  const glowX = useTransform(mx, [-0.5, 0.5], ["30%", "70%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["20%", "80%"]);
  const glow = useMotionTemplate`radial-gradient(360px circle at ${glowX} ${glowY}, rgba(34,211,238,0.14), transparent 55%)`;

  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.12 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          const rect = ref.current?.getBoundingClientRect();
          if (!rect) return;
          mx.set((e.clientX - rect.left) / rect.width - 0.5);
          my.set((e.clientY - rect.top) / rect.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="group relative h-full overflow-hidden rounded-2xl glass p-6"
      >
        <motion.div
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="absolute inset-0 rounded-2xl border border-transparent transition-colors duration-300 group-hover:border-cyan-400/25" />

        <div style={{ transform: "translateZ(28px)" }} className="relative">
          <div
            className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/12 to-blue-600/10 text-cyan-300 transition-shadow duration-300 group-hover:shadow-glow-sm`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-display text-base font-semibold text-slate-100">
            {feature.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {feature.desc}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32" id="features">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Platform Capabilities
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for{" "}
            <span className="text-gradient">Trusted Evidence</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Every capability is designed around a single promise: if evidence
            changes, you will know.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <TiltCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}