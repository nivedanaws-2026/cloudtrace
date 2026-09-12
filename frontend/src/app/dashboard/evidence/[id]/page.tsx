"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileStack,
  ScanSearch,
  Link2,
  Calendar,
  User,
  HardDrive,
  FileText,
  Hash,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { loadEvidenceList } from "@/lib/evidence-service";
import { IntegrityBadge } from "@/components/ui/Badge";
import Fingerprint from "@/components/dashboard/Fingerprint";
import HashBox from "@/components/ui/HashBox";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { formatBytes, formatDateTime, fileExtension } from "@/lib/format";
import type { EvidenceRecord } from "@/lib/types";

export default function EvidenceDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { records } = await loadEvidenceList();
        const found = records.find((r) => r.id === params.id);
        if (mounted) setEvidence(found ?? null);
      } catch {
        if (mounted) toast.error("Could not load evidence");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, toast]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center">
        <HardDrive className="h-10 w-10 text-slate-600" />
        <p className="font-display text-lg font-semibold text-slate-200">
          Evidence not found
        </p>
        <p className="text-sm text-slate-500">
          No record matches ID{" "}
          <code className="font-mono text-cyan-300">{params.id}</code>.
        </p>
      </div>
    );
  }

  const idShort = evidence.id.replace(/-/g, "").slice(0, 8).toUpperCase();

  const meta = [
    {
      icon: FileText,
      label: "File Name",
      value: evidence.filename,
    },
    {
      icon: ClipboardList,
      label: "File Type",
      value: evidence.fileType || "—",
    },
    {
      icon: HardDrive,
      label: "File Size",
      value: formatBytes(evidence.fileSize),
    },
    {
      icon: User,
      label: "Uploaded By",
      value: evidence.uploadedByName || evidence.uploadedBy,
    },
    {
      icon: Calendar,
      label: "Created At",
      value: formatDateTime(evidence.uploaded_at),
    },
    {
      icon: Hash,
      label: "Evidence ID",
      value: `#${idShort}`,
      mono: true,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Evidence <span className="font-mono text-cyan-300">#{idShort}</span>
            </p>
            <h2 className="mt-1 flex flex-wrap items-center gap-3 font-display text-xl font-bold tracking-tight text-white">
              <FileStack className="h-5 w-5 text-cyan-300" />
              {evidence.filename}
            </h2>
          </div>
          <IntegrityBadge status={evidence.status} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Hash className="h-3.5 w-3.5 text-cyan-300" />
            Cryptographic Fingerprint
          </p>
          <Fingerprint hash={evidence.sha256_hash} match={evidence.status === "intact"} />
          <div className="mt-4">
            <HashBox hash={evidence.sha256_hash} label={`SHA-256 · ${fileExtension(evidence.filename)}`} />
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-cyan-300/80" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest">
                    {m.label}
                  </p>
                </div>
                <p
                  className={`mt-1.5 truncate text-sm font-medium text-slate-100 ${
                    m.mono ? "font-mono text-cyan-200" : ""
                  }`}
                  title={m.value}
                >
                  {m.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/verify?evidence=${evidence.id}`}>
            <Button icon={<ScanSearch className="h-4 w-4" />}>
              Verify Integrity
            </Button>
          </Link>
          <Link href={`/dashboard/evidence/${evidence.id}/custody`}>
            <Button variant="outline" icon={<Link2 className="h-4 w-4" />}>
              View Custody Chain
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}