"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Clock3, RefreshCw, Trash2 } from "lucide-react";
import { AdminApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import RoleGuard from "@/components/layout/RoleGuard";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { EmptyState, ErrorBanner } from "@/components/ui/StatePanels";
import { formatDateTime } from "@/lib/format";
import { ApiError } from "@/lib/api";
import type { Role, UserRecord } from "@/lib/types";

const ROLES: Role[] = ["investigator", "custodian", "auditor", "admin"];

export default function PendingApprovalsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [assigned, setAssigned] = useState<Record<string, Role>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    try {
      const data = await AdminApi.pending();
      setRequests(data);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return;
      setOffline(true);
      toast.error("Could not load pending approvals");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = useCallback(
    async (email: string, role: Role) => {
      setBusyEmail(email);
      try {
        await AdminApi.approve(email, role);
        setRequests((prev) => prev.filter((u) => u.email !== email));
        toast.success("Account approved", `${email} is now an ${role}.`);
      } catch (error) {
        toast.error("Approval failed", error instanceof ApiError ? error.message : "Please try again.");
      } finally {
        setBusyEmail(null);
      }
    },
    [toast],
  );

  const reject = useCallback(
    async (email: string) => {
      setBusyEmail(email);
      try {
        await AdminApi.reject(email);
        setRequests((prev) => prev.filter((u) => u.email !== email));
        toast.info("Signup rejected", `Removed ${email} from pending.`);
      } catch (error) {
        toast.error("Could not reject", error instanceof ApiError ? error.message : "Please try again.");
      } finally {
        setBusyEmail(null);
      }
    },
    [toast],
  );

  return (
    <RoleGuard allow={["admin"]}>
      <PageTransition>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                Pending Approvals
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Accounts signed up but not yet granted access. Approve a user to
                activate them and assign their role.
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

          {offline && (
            <ErrorBanner message="Could not reach the backend to list pending signups. Confirm the API is running and try again." />
          )}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<UserCheck className="h-5 w-5" />}
              title="No accounts waiting for approval"
              message="When someone signs up, their request appears here for you to review."
            />
          ) : (
            <div className="space-y-3">
              {requests.map((request, i) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-sm font-bold text-amber-300">
                        {request.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-100">
                          {request.email}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock3 className="h-3 w-3" />
                          Requested {formatDateTime(request.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={assigned[request.email] ?? "investigator"}
                        onChange={(e) =>
                          setAssigned((prev) => ({
                            ...prev,
                            [request.email]: e.target.value as Role,
                          }))
                        }
                        className="appearance-none rounded-lg border border-white/10 bg-ink-900/70 px-3 py-2 text-xs font-medium text-slate-200 transition focus:border-cyan-400/50 focus:outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        icon={busyEmail === request.email ? undefined : <UserCheck className="h-3.5 w-3.5" />}
                        loading={busyEmail === request.email}
                        onClick={() => approve(request.email, assigned[request.email] ?? "investigator")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                        onClick={() => reject(request.email)}
                        disabled={busyEmail !== null}
                        className="text-slate-500 hover:text-rose-300"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>

                  {user && (
                    <p className="mt-3 border-t border-white/[0.05] pt-2.5 text-[11px] text-slate-500">
                      An approved account can immediately log in with the role you
                      select below.
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}