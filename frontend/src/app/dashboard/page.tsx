"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileStack,
  ShieldCheck,
  ShieldAlert,
  Link2,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import StatCard from "@/components/dashboard/StatCard";
import SystemStatus from "@/components/dashboard/SystemStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { HealthApi } from "@/lib/api";
import { loadEvidenceList } from "@/lib/evidence-service";
import { demoSystemComponents } from "@/lib/demo-data";
import { demoStats } from "@/lib/demo-data";
import { formatBytes, formatRelative } from "@/lib/format";
import type { EvidenceRecord, SystemComponent } from "@/lib/types";

function RecentEvidence({ records, loading }: { records: EvidenceRecord[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (records.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No evidence uploaded yet.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {records.slice(0, 4).map((r) => (
        <Link
          key={r.id}
          href={`/dashboard/evidence/${r.id}`}
          className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-750 text-cyan-300">
            <FileStack className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-slate-200">
              {r.filename}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatBytes(r.fileSize)} · {formatRelative(r.uploaded_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                r.status === "intact" ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<SystemComponent[]>([
    { id: "api", label: "API", status: "operational", note: "Connecting…" },
    { id: "db", label: "Database", status: "operational", note: "Amazon RDS · PostgreSQL" },
    { id: "storage", label: "Storage", status: "operational", note: "AWS S3 bucket" },
    { id: "auth", label: "Authentication", status: "operational", note: "JWT issuance" },
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { records: data } = await loadEvidenceList();
        if (!mounted) return;
        setRecords(data);
      } catch {
        if (mounted) toast.error("Could not load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }

      try {
        const health = await HealthApi.check();
        if (mounted) setComponents(demoSystemComponents(health));
      } catch {
        if (mounted) setComponents(demoSystemComponents(null));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const stats = demoStats(records);

  const firstName = user && user.email ? user.email.split("@")[0] : "";

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s the current integrity status of your evidence vault.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FileStack}
            label="Total Evidence"
            value={stats.total}
            accent="cyan"
            delay={0.05}
          />
          <StatCard
            icon={ShieldCheck}
            label="Verified Evidence"
            value={stats.verified}
            accent="emerald"
            delay={0.12}
          />
          <StatCard
            icon={ShieldAlert}
            label="Integrity Issues"
            value={stats.compromised}
            accent="rose"
            delay={0.19}
          />
          <StatCard
            icon={Link2}
            label="Custody Events"
            value={stats.custodyEvents}
            accent="violet"
            delay={0.26}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-slate-100">
                  Recent Evidence
                </h3>
                <Link
                  href="/dashboard/evidence"
                  className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <RecentEvidence records={records} loading={loading} />
            </div>
          </div>

          <div>
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
      </div>
    </PageTransition>
  );
}