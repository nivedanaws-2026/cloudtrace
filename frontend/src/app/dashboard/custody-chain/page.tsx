"use client";

import { useCallback, useState } from "react";
import { Search, Link2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import RoleGuard from "@/components/layout/RoleGuard";
import CustodyTimeline from "@/components/dashboard/CustodyTimeline";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { ErrorBanner, EmptyState } from "@/components/ui/StatePanels";
import { loadCustodyChain, validateEvidenceId } from "@/lib/evidence-service";
import { ApiError } from "@/lib/api";
import type { CustodyEvent } from "@/lib/types";

export default function CustodyChainPage() {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [events, setEvents] = useState<CustodyEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (evidenceId: string) => {
      const id = evidenceId.trim();
      if (!id) return;
      if (!validateEvidenceId(id)) {
        setError("That doesn't look like a valid evidence ID (UUID-format).");
        setEvents(null);
        setQuery(id);
        return;
      }
      setQuery(id);
      setEvents(null);
      setError(null);
      setLoading(true);
      try {
        setEvents(await loadCustodyChain(id));
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail ?? err.message);
        } else {
          setError("Could not fetch the custody chain.");
        }
        setEvents(null);
        toast.error("Custody chain lookup failed");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return (
    <RoleGuard allow={["auditor"]}>
      <PageTransition>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Custody Chain Viewer
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter an evidence ID to inspect its full chain of custody and the
              cryptographic link between every event.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 7c3f9a1e-0b42-4c57-9d8e-2f6a1b0c3d45"
              className="w-full rounded-xl border border-white/10 bg-ink-900/70 px-4 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-600 transition placeholder:font-sans focus:border-cyan-400/50 focus:outline-none"
            />
            <Button
              type="submit"
              icon={<Search className="h-4 w-4" />}
              disabled={!input.trim() || loading}
            >
              Trace
            </Button>
          </form>

          {error && (
            <ErrorBanner
              message={error}
            />
          )}

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!loading && events && (
            <CustodyTimeline events={events} />
          )}

          {!loading && !events && !error && (
            <EmptyState
              icon={<Link2 className="h-5 w-5" />}
              title="Enter an evidence ID"
              message="The timeline of custody events — who handled the record, when, and the hash chain proving nothing was altered — will render here."
            />
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}