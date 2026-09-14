"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ChevronDown, FileStack, Inbox } from "lucide-react";
import type { EvidenceRecord } from "@/lib/types";
import { IntegrityBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime, fileExtension, shortHash } from "@/lib/format";

type StatusFilter = "all" | "intact" | "mismatch" | "unverified";

export default function EvidenceTable({
  records,
  loading,
  fromDemo,
  offline = false,
}: {
  records: EvidenceRecord[];
  loading?: boolean;
  fromDemo?: boolean;
  offline?: boolean;
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
        r.uploaded_email.toLowerCase().includes(q);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [records, query, status]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="appearance-none rounded-lg border border-white/10 bg-ink-900/70 py-2.5 pl-4 pr-9 text-sm text-slate-200 transition focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="all">All verification states</option>
            <option value="intact">Integrity intact</option>
            <option value="mismatch">Mismatch detected</option>
            <option value="unverified">Unverified</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {offline && (
        <p className="mb-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-[11px] text-amber-200/90">
          Showing this session&apos;s evidence — the backend is unreachable, so
          no live records are listed.
        </p>
      )}
      {fromDemo && !offline && (
        <p className="mb-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-[11px] text-amber-200/90">
          Live records are unavailable right now — showing fallback data.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/10 py-14 text-center">
          <Inbox className="h-8 w-8 text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-300">
              {query ? "No matching evidence" : "No evidence yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {query ? "Try adjusting your search." : "Upload evidence to see it here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <div className="hidden grid-cols-[1.6fr_1fr_0.9fr_1.1fr_0.7fr] gap-4 border-b border-white/[0.06] bg-ink-900/40 px-5 py-3 md:grid">
            {["Evidence", "Uploader", "Uploaded", "SHA-256", "Status"].map((h) => (
              <p
                key={h}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
              >
                {h}
              </p>
            ))}
          </div>

          <div className="divide-y divide-white/[0.05]">
            {filtered.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
              >
                <Link
                  href={`/dashboard/evidence/${record.id}`}
                  className="group grid items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink-800/60 md:grid-cols-[1.6fr_1fr_0.9fr_1.1fr_0.7fr]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-ink-750 text-cyan-300">
                      <FileStack className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100 group-hover:text-cyan-200">
                        {record.filename}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {fileExtension(record.filename)} ·{" "}
                        <span className="font-mono normal-case">
                          {shortHash(record.id)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="hidden truncate text-xs text-slate-400 md:block">
                    {record.uploaded_email || "—"}
                  </p>
                  <p className="hidden truncate text-xs text-slate-400 md:block">
                    {formatDateTime(record.uploaded_at)}
                  </p>
                  <p className="hidden truncate font-mono text-[11px] text-cyan-200/70 md:block">
                    {shortHash(record.sha256_hash, 10, 6)}
                  </p>
                  <div className="flex items-center justify-between gap-2 md:justify-start">
                    <IntegrityBadge status={record.status} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}