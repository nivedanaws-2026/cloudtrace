"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import EvidenceTable from "@/components/dashboard/EvidenceTable";
import Button from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/Motion";
import { loadEvidenceList } from "@/lib/evidence-service";
import type { EvidenceRecord } from "@/lib/types";
import type { Role } from "@/lib/types";

const CAN_UPLOAD: Role[] = ["investigator", "custodian", "admin"];

export default function EvidencePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDemo, setFromDemo] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loadEvidenceList();
      setRecords(res.records);
      setFromDemo(res.fromDemo);
    } catch {
      toast.error("Could not load evidence");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const canUpload = user ? CAN_UPLOAD.includes(user.role) : false;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Evidence Records
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage, inspect, and verify all submitted digital evidence.
            </p>
          </div>
          {canUpload && (
            <Link href="/dashboard/evidence/upload">
              <Button icon={<UploadCloud className="h-4 w-4" />}>
                Upload Evidence
              </Button>
            </Link>
          )}
        </div>

        <EvidenceTable records={records} loading={loading} fromDemo={fromDemo} />
      </div>
    </PageTransition>
  );
}