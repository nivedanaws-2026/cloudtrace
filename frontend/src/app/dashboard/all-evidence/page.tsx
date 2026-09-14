"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, FileStack } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import RoleGuard from "@/components/layout/RoleGuard";
import EvidenceTable from "@/components/dashboard/EvidenceTable";
import Button from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/Motion";
import { EmptyState, OfflineBanner } from "@/components/ui/StatePanels";
import { loadAllEvidence } from "@/lib/evidence-service";
import type { EvidenceRecord } from "@/lib/types";

export default function AllEvidencePage() {
  const toast = useToast();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    try {
      const { records: data, fromDemo } = await loadAllEvidence();
      setRecords(data);
      setOffline(fromDemo);
    } catch {
      toast.error("Could not load evidence");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <RoleGuard allow={["auditor", "admin"]}>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                All Evidence
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Read-only ledger of every evidence record and its integrity
                status.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh
            </Button>
          </div>

          {offline && <OfflineBanner />}

          {!loading && !offline && records.length === 0 ? (
            <EmptyState
              icon={<FileStack className="h-5 w-5" />}
              title="No evidence on record"
              message="Uploaded evidence and its custody chains will appear here."
            />
          ) : (
            <EvidenceTable records={records} loading={loading} offline={offline} />
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}