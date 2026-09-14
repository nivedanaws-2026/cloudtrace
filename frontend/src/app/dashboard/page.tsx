"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Users,
  Scale,
  FileStack,
  UploadCloud,
  Link2,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { PageTransition } from "@/components/ui/Motion";
import { ErrorBanner } from "@/components/ui/StatePanels";
import { getSessionUploads } from "@/lib/evidence-service";
import { HealthApi } from "@/lib/api";
import { demoSystemComponents } from "@/lib/demo-data";
import type { Role, SystemComponent } from "@/lib/types";
import { roleColors } from "@/lib/auth-store";

const ROLE_INTRO: Record<
  Role,
  { title: string; description: string; badge: string }
> = {
  admin: {
    title: "Full visibility",
    description:
      "Approve new users, assign roles, and inspect every piece of evidence on the platform.",
    badge: "Administrator",
  },
  investigator: {
    title: "Investigator workspace",
    description:
      "Upload evidence, then view and verify only the items you submitted.",
    badge: "Investigator",
  },
  custodian: {
    title: "Custodian workspace",
    description:
      "Handle custody of the evidence you uploaded — upload, inspect, and verify your items.",
    badge: "Custodian",
  },
  auditor: {
    title: "Read-only compliance view",
    description:
      "Full visibility across all evidence and every custody chain, for independent verification.",
    badge: "Auditor",
  },
};

function SectionLink({
  href,
  icon,
  title,
  desc,
  delay,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="glass group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:border-cyan-400/25 hover:shadow-glow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-300" />
      </div>
      <p className="mt-4 font-display text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tone}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-100">
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [components, setComponents] = useState<SystemComponent[]>(demoSystemComponents(null));
  const [apiDown, setApiDown] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const health = await HealthApi.check();
        if (mounted) {
          setComponents(demoSystemComponents(health));
          setApiDown(false);
        }
      } catch {
        if (mounted) {
          setComponents(demoSystemComponents(null));
          setApiDown(true);
        }
        if (!mounted) toast.error("Backend unreachable");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  if (!user) return null;

  const intro = ROLE_INTRO[user.role];
  const firstName = user.email ? user.email.split("@")[0] : "";

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p
              className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${roleColors[user.role]}`}
            >
              {intro.badge}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{intro.description}</p>
          </div>
        </div>

        {apiDown && (
          <ErrorBanner message="The backend API is unreachable. Live evidence and approval data will not load until it is back." />
        )}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {user.role === "admin" && (
            <>
              <SectionLink
                href="/dashboard/pending-approvals"
                icon={<Clock3 className="h-5 w-5" />}
                title="Pending Approvals"
                desc="Activate and assign roles to new signups waiting for approval."
                delay={0.05}
              />
              <SectionLink
                href="/dashboard/users"
                icon={<Users className="h-5 w-5" />}
                title="All Users"
                desc="Review every account and revoke access if needed."
                delay={0.1}
              />
              <SectionLink
                href="/dashboard/all-evidence"
                icon={<Scale className="h-5 w-5" />}
                title="All Evidence"
                desc="Inspect every uploaded evidence record on the platform."
                delay={0.15}
              />
            </>
          )}

          {user.role === "investigator" && (
            <>
              <SectionLink
                href="/dashboard/upload"
                icon={<UploadCloud className="h-5 w-5" />}
                title="Upload Evidence"
                desc="Fingerprint a new file with SHA-256 and open its custody chain."
                delay={0.05}
              />
              <SectionLink
                href="/dashboard/my-evidence"
                icon={<FileStack className="h-5 w-5" />}
                title="My Evidence"
                desc="Review and verify the evidence you submitted."
                delay={0.1}
              />
            </>
          )}

          {user.role === "custodian" && (
            <>
              <SectionLink
                href="/dashboard/upload"
                icon={<UploadCloud className="h-5 w-5" />}
                title="Upload Evidence"
                desc="Accept a new item into custody and fingerprint it."
                delay={0.05}
              />
              <SectionLink
                href="/dashboard/my-evidence"
                icon={<FileStack className="h-5 w-5" />}
                title="My Evidence"
                desc="Manage custody of the items you are responsible for."
                delay={0.1}
              />
            </>
          )}

          {user.role === "auditor" && (
            <>
              <SectionLink
                href="/dashboard/all-evidence"
                icon={<Scale className="h-5 w-5" />}
                title="All Evidence"
                desc="Browse every evidence record with full read-only visibility."
                delay={0.05}
              />
              <SectionLink
                href="/dashboard/custody-chain"
                icon={<Link2 className="h-5 w-5" />}
                title="Custody Chain Viewer"
                desc="Open any evidence ID and examine its tamper-evident chain."
                delay={0.1}
              />
            </>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <MiniStat
              icon={<FileStack className="h-5 w-5" />}
              label={user.role === "auditor" || user.role === "admin" ? "Evidence Session" : "My Evidence"}
              value={String(getSessionUploads().length)}
              tone="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
            />
            <MiniStat
              icon={<UploadCloud className="h-5 w-5" />}
              label="Role"
              value={user.role.toUpperCase()}
              tone="border-violet-400/20 bg-violet-400/10 text-violet-300"
            />
            <MiniStat
              icon={<Activity className="h-5 w-5" />}
              label="API Status"
              value={apiDown ? "OFFLINE" : "ONLINE"}
              tone={
                apiDown
                  ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                  : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              }
            />
            <MiniStat
              icon={<Link2 className="h-5 w-5" />}
              label="Custody Events"
              value={String(getSessionUploads().length * 2 + 1)}
              tone="border-sky-400/20 bg-sky-400/10 text-sky-300"
            />
          </div>

          <div className="glass h-full rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-300" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                System Status
              </h3>
            </div>
            <SystemStatus components={components} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}