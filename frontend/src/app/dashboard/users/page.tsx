"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ShieldOff, RefreshCw, Clock3 } from "lucide-react";
import { AdminApi } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { RoleBadge } from "@/components/ui/Badge";
import RoleGuard from "@/components/layout/RoleGuard";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageTransition } from "@/components/ui/Motion";
import { EmptyState, ErrorBanner } from "@/components/ui/StatePanels";
import { formatDateTime } from "@/lib/format";
import type { UserRecord } from "@/lib/types";

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setOffline(false);
    try {
      setUsers(await AdminApi.users());
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return;
      setOffline(true);
      setUsers([]);
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const revoke = useCallback(
    async (email: string) => {
      setBusyEmail(email);
      try {
        const updated = await AdminApi.revoke(email);
        setUsers((prev) => prev.map((u) => (u.email === email ? updated : u)));
        toast.info("Access revoked", `${email} can no longer log in.`);
      } catch (error) {
        toast.error("Revoke failed", error instanceof ApiError ? error.message : "Please try again.");
      } finally {
        setBusyEmail(null);
      }
    },
    [toast],
  );

  const pendingCount = users.filter((u) => !u.is_active).length;

  return (
    <RoleGuard allow={["admin"]}>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                All Users
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Every account on the platform — active and waiting for approval.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Link href="/dashboard/pending-approvals">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Clock3 className="h-3.5 w-3.5" />}
                  >
                    {pendingCount} pending
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                icon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Refresh
              </Button>
            </div>
          </div>

          {offline && (
            <ErrorBanner message="Could not reach the backend to list users. Confirm the API is running and try again." />
          )}

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 && !offline ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No users yet"
              message="Accounts will appear here as people sign up."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <div className="hidden grid-cols-[1.5fr_0.7fr_0.8fr_0.9fr_0.6fr] gap-4 border-b border-white/[0.06] bg-ink-900/40 px-5 py-3 md:grid">
                {["User", "Role", "Status", "Created", ""].map((h) => (
                  <p
                    key={h}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    {h}
                  </p>
                ))}
              </div>

              <div className="divide-y divide-white/[0.05]">
                {users.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="grid items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink-800/50 md:grid-cols-[1.5fr_0.7fr_0.8fr_0.9fr_0.6fr]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {u.email}
                      </p>
                    </div>
                    <div>
                      <RoleBadge role={u.role} />
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                          u.is_active ? "text-emerald-300" : "text-amber-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.is_active ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        {u.is_active ? "Active" : "Pending"}
                      </span>
                    </div>
                    <p className="hidden text-[11px] text-slate-500 md:block">
                      {formatDateTime(u.created_at)}
                    </p>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<ShieldOff className="h-3.5 w-3.5" />}
                        loading={busyEmail === u.email}
                        disabled={!u.is_active || busyEmail !== null}
                        onClick={() => revoke(u.email)}
                        className="text-slate-500 hover:text-rose-300"
                      >
                        Revoke
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </RoleGuard>
  );
}