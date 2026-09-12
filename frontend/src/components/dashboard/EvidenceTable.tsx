"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  FileStack,
  ChevronDown,
  Filter,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import type { EvidenceRecord } from "@/lib/types";
import { IntegrityBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatBytes, formatDateTime, fileExtension, shortHash } from "@/lib/format";

type StatusFilter = "all" | "intact" | "compromised";

export default function EvidenceTable({
  records,
  loading,
  fromDemo,
  compact = false,
}: {
  records: EvidenceRecord[];
  loading?: boolean;
  fromDemo?: boolean;
  compact?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      const matchesQuery =
        !q ||
        r.filename.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.uploadedByName.toLowerCase().includes(q);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, status]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name, evidence ID, or uploader…"
            className="w-full rounded-lg border border-white/10 bg-ink-900/70 py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="appearance-none rounded-lg border border-white/10 bg-ink-900/70 py-2.5 pl-9 pr-8 text-sm text-slate-200 transition focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All integrity</option>
            <option value="intact">Intact</option>
            <option value="compromised">Compromised</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {fromDemo && (
        <p className="mb-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-[11px] text-amber-200/90">
          Showing demo evidence — connect the <code className="font-mono">GET /evidence</code> endpoint for live records.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-14 text-center">
          {status === "compromised" ? (
            <ShieldAlert className="h-8 w-8 text-slate-600" />
          ) : (
            <Inbox className="h-8 w-8 text-slate-600" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-300">
              {query || status !== "all" ? "No matching evidence" : "No evidence yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {query || status !== "all"
                ? "Try adjusting your search or filters."
                : "Upload evidence to see it here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`/dashboard/evidence/${record.id}`}
                className="group grid items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/50 px-4 py-3.5 transition-all duration-200 hover:border-cyan-400/25 hover:bg-ink-800/60 hover:shadow-glow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-750 text-cyan-300">
                      <FileStack className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100 group-hover:text-cyan-200">
                        {record.filename}
                      </p>
                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono uppercase">
                          {fileExtension(record.filename)}
                        </span>
                        <span>·</span>
                        <span>{formatBytes(record.fileSize)}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">
                          {formatDateTime(record.uploaded_at)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {!compact && (
                    <>
                      <div className="hidden min-w-0 md:block">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          SHA-256
                        </p>
                        <p className="font-mono text-[11px] text-cyan-200/80">
                          {shortHash(record.sha256_hash)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <IntegrityBadge status={record.status} />
                      </div>
                    </>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}