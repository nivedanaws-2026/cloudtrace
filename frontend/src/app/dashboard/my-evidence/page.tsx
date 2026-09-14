"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UploadCloud, FileStack } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import RoleGuard from "@/components/layout/RoleGuard";
import EvidenceTable from "@/components/dashboard/EvidenceTable";
import Button from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/Motion";
import { EmptyState, OfflineBanner } from "@/components/ui/StatePanels";
import { loadMyEvidence } from "@/lib/evidence-service";
import type { EvidenceRecord } from "@/lib/types";

export default function MyEvidencePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setOffline(false);
    try {
      const { records: data, fromDemo } = await loadMyEvidence(user.email);
      setRecords(data);
      setOffline(fromDemo);
    } catch {
      toast.error("Could not load your evidence");
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <RoleGuard allow={["investigator", "custodian"]}>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                My Evidence
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Evidence records you uploaded this session or retrieved from the
                backend.
              </p>
            </div>
            <Link href="/dashboard/upload">
              <Button icon={<UploadCloud className="h-4 w-4" />}>
                Upload Evidence
              </Button>
            </Link>
          </div>

          {offline && <OfflineBanner />}

          {!loading && !offline && records.length === 0 ? (
            <EmptyState
              icon={<FileStack className="h-5 w-5" />}
              title="You haven't uploaded any evidence yet"
              message="Upload your first file to fingerprint it and open a custody chain."
              action={
                <Link href="/dashboard/upload">
                  <Button icon={<UploadCloud className="h-4 w-4" />}>
                    Upload your first file
                  </Button>
                </Link>
              }
            />
          ) : (
            <EvidenceTable records={records} loading={loading} offline={offline} />
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}