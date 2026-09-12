"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Link2, ArrowLeft, HardDrive } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { loadCustodyChain, loadEvidenceList } from "@/lib/evidence-service";
import CustodyTimeline from "@/components/dashboard/CustodyTimeline";
import { Skeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/Motion";
import { formatEvidenceId } from "@/lib/format";
import type { CustodyEvent, EvidenceRecord } from "@/lib/types";

export default function CustodyChainPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [events, setEvents] = useState<CustodyEvent[]>([]);
  const [evidence, setEvidence] = useState<EvidenceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDemo, setFromDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [chain, list] = await Promise.all([
          loadCustodyChain(params.id),
          loadEvidenceList(),
        ]);
        if (!mounted) return;
        setEvents(chain.events);
        setFromDemo(chain.fromDemo);
        setEvidence(list.records.find((r) => r.id === params.id) ?? null);
      } catch {
        if (mounted) toast.error("Could not load custody chain");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, toast]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href={`/dashboard/evidence/${params.id}`}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to evidence
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                Chain of Custody
              </h2>
              <p className="text-sm text-slate-400">
                {evidence ? (
                  <>
                    {evidence.filename} ·{" "}
                    <span className="font-mono text-cyan-300">
                      {formatEvidenceId(evidence.id)}
                    </span>
                  </>
                ) : (
                  <span className="font-mono">{params.id}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <HardDrive className="h-9 w-9 text-slate-600" />
            <p className="text-sm text-slate-400">
              No custody events found for this evidence.
            </p>
            {evidence && (
              <Link href={`/dashboard/verify?evidence=${evidence.id}`}>
                <Button variant="outline" size="sm">
                  Run a verification to create the next event
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <CustodyTimeline events={events} fromDemo={fromDemo} />
        )}
      </div>
    </PageTransition>
  );
}