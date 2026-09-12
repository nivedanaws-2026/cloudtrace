"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Server,
  CloudCog,
  Database,
  Boxes,
  KeyRound,
  Container,
  GitBranch,
  Gauge,
  Activity,
} from "lucide-react";
import { Reveal } from "@/components/ui/Motion";
import { FlowConnector } from "@/components/landing/PipelineVisual";

function ArchNode({
  icon,
  title,
  sub,
  delay = 0,
  width = "w-full",
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  delay?: number;
  width?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`glass flex items-center gap-3.5 rounded-xl px-5 py-3.5 ${width}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 text-cyan-300">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm font-bold tracking-wide text-slate-100">
          {title}
        </p>
        {sub && <p className="truncate text-[11px] text-slate-500">{sub}</p>}
      </div>
    </motion.div>
  );
}

const TOOLS = [
  { icon: Container, label: "Docker", sub: "Containers" },
  { icon: GitBranch, label: "GitHub Actions", sub: "CI/CD" },
  { icon: Boxes, label: "Docker Hub", sub: "Registry" },
  { icon: Gauge, label: "Prometheus", sub: "Metrics" },
  { icon: Activity, label: "Grafana", sub: "Dashboards" },
  { icon: KeyRound, label: "IAM", sub: "Access control" },
];

export default function Architecture() {
  return (
    <section className="relative py-24 sm:py-32" id="architecture">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            Cloud Architecture
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for <span className="text-gradient">the Cloud</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Cloud-native architecture designed for secure, scalable evidence
            management.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Stack visual */}
          <div className="relative rounded-2xl glass-strong p-8">
            <div className="absolute right-6 top-5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                CloudTrace Stack
              </span>
            </div>

            <div className="flex flex-col items-center">
              <ArchNode
                icon={<Code2 className="h-5 w-5" />}
                title="NEXT.JS"
                sub="Frontend · App Router"
                width="max-w-sm"
              />
              <FlowConnector height={42} delay={0} />
              <ArchNode
                icon={<Server className="h-5 w-5" />}
                title="FASTAPI"
                sub="REST API · FastAPI + SQLAlchemy"
                width="max-w-sm"
              />
              <FlowConnector height={42} delay={0.3} />

              <div className="grid w-full max-w-lg grid-cols-2 gap-x-4">
                <div className="flex flex-col items-center">
                  <ArchNode
                    icon={<CloudCog className="h-5 w-5" />}
                    title="AWS S3"
                    sub="Evidence object storage"
                    delay={0.2}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ArchNode
                    icon={<Database className="h-5 w-5" />}
                    title="AMAZON RDS"
                    sub="PostgreSQL metadata"
                    delay={0.3}
                  />
                </div>
              </div>

              <FlowConnector height={42} delay={0.5} />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative max-w-sm w-full rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/[0.08] to-blue-600/[0.08] px-5 py-3.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-ink-800 text-cyan-300">
                    <Boxes className="h-5 w-5" />
                    <span className="absolute inset-0 rounded-lg border border-cyan-400/25 animate-pulse-ring" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold tracking-wide text-white">
                      KUBERNETES
                    </p>
                    <p className="text-[11px] text-slate-400">
                      3 replicas · autoscaling · rolling deploys
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {[0, 1, 2].map((r) => (
                    <motion.span
                      key={r}
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        delay: r * 0.5,
                      }}
                      className="h-1.5 flex-1 rounded-full bg-cyan-400/60"
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Tooling */}
          <div>
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Supporting Infrastructure
              </p>
            </Reveal>
            <div className="mt-5 grid grid-cols-2 gap-3.5">
              {TOOLS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.div
                    key={t.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -3, borderColor: "rgba(34,211,238,0.3)" }}
                    className="glass card-hover rounded-xl px-4 py-3.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-cyan-300" />
                      <p className="font-display text-[13px] font-semibold text-slate-200">
                        {t.label}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{t.sub}</p>
                  </motion.div>
                );
              })}
            </div>
            <Reveal delay={0.2}>
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-ink-800/40 px-4 py-3.5">
                <p className="text-xs leading-relaxed text-slate-400">
                  <span className="font-semibold text-cyan-300">
                    IAM-first security:
                  </span>{" "}
                  every service authenticates through AWS IAM roles with
                  least-privilege policies. No credentials reach the frontend.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}