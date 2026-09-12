"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Boxes,
  Cloud,
  Database,
  Server,
  ShieldCheck,
} from "lucide-react";

function ClusterGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
      <circle cx="6" cy="7" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="7" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="6" cy="17" r="1.7" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="17" r="1.7" fill="currentColor" opacity="0.7" />
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.55">
        <line x1="7.6" y1="8" x2="10.3" y2="10.4" />
        <line x1="16.4" y1="8" x2="13.7" y2="10.4" />
        <line x1="7.6" y1="16" x2="10.3" y2="13.6" />
        <line x1="16.4" y1="16" x2="13.7" y2="13.6" />
        <line x1="6" y1="9" x2="6" y2="15" />
        <line x1="18" y1="9" x2="18" y2="15" />
      </g>
    </svg>
  );
}

interface NodeDef {
  top: string;
  left: string;
  label: string;
  sub: string;
  icon: ReactNode;
  drift: number;
  flip?: boolean;
  right?: string;
}

const NODES: NodeDef[] = [
  {
    top: "18%",
    left: "-4%",
    label: "AWS Cloud",
    sub: "us-east-1",
    icon: <Cloud className="h-4 w-4" />,
    drift: 0,
  },
  {
    top: "46%",
    left: "-7%",
    label: "Kubernetes",
    sub: "3 nodes · ready",
    icon: <ClusterGlyph />,
    drift: 1,
    flip: true,
  },
  {
    top: "74%",
    left: "-3%",
    label: "Amazon RDS",
    sub: "PostgreSQL",
    icon: <Database className="h-4 w-4" />,
    drift: 2,
  },
  {
    top: "8%",
    left: "auto",
    right: "4%",
    label: "S3 Bucket",
    sub: "evidence-bucket",
    icon: <Boxes className="h-4 w-4" />,
    drift: 0,
    flip: true,
  },
  {
    top: "38%",
    left: "auto",
    right: "-5%",
    label: "FastAPI",
    sub: "Pod · healthy",
    icon: <Server className="h-4 w-4" />,
    drift: 1,
  },
  {
    top: "66%",
    left: "auto",
    right: "0%",
    label: "IAM Policy",
    sub: "least-privilege",
    icon: <ShieldCheck className="h-4 w-4" />,
    drift: 2,
    flip: true,
  },
];

export default function CloudNodes({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {NODES.map((n, i) => (
        <motion.div
          key={n.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.6 + i * 0.25 }}
          className="absolute hidden lg:block"
          style={{ top: n.top, left: n.left, right: n.right }}
        >
          <motion.div
            animate={{ y: [0, n.flip ? 14 : -14, 0], x: [0, n.flip ? -8 : 8, 0] }}
            transition={{
              y: { duration: 6 + n.drift * 1.7, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 8 + n.drift * 2, repeat: Infinity, ease: "easeInOut" },
            }}
            className="glass flex items-center gap-2.5 rounded-xl px-3 py-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-ink-700/60 text-cyan-300">
              {n.icon}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-200">{n.label}</p>
              <p className="text-[10px] text-slate-500">{n.sub}</p>
            </div>
          </motion.div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[6%] top-[22%] hidden h-40 w-40 rounded-full border border-cyan-400/10 lg:block"
      />
    </div>
  );
}