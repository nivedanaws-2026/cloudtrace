"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCog, ShieldAlert, Pencil, UserPlus } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import AuthGuard from "@/components/layout/AuthGuard";
import { RoleBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { PageTransition } from "@/components/ui/Motion";
import { DEMO_USERS } from "@/lib/demo-data";
import { roleColors } from "@/lib/auth-store";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Role, UserRecord } from "@/lib/types";

const ROLES: Role[] = ["investigator", "custodian", "auditor", "admin"];

export default function UsersPage() {
  const toast = useToast();
  const [editing, setEditing] = useState<UserRecord | null>(null);

  const pending = (title: string) =>
    toast.info(
      title,
      "User management endpoints are not wired yet — this is a UI placeholder.",
    );

  return (
    <AuthGuard roles={["admin"]}>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-white">
                User Management
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Manage roles and access across the evidence platform.
              </p>
            </div>
            <Button
              icon={<UserPlus className="h-4 w-4" />}
              onClick={() => pending("Invite user")}
            >
              Invite User
            </Button>
          </div>

          <div className="glass rounded-2xl">
            <div className="hidden grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto] gap-4 border-b border-white/[0.06] px-5 py-3 md:grid">
              {["User", "Role", "Status", "Last Active", ""].map((h) => (
                <p
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                  {h}
                </p>
              ))}
            </div>

            <div className="divide-y divide-white/[0.05]">
              {DEMO_USERS.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.02] md:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${roleColors[u.role]}`}
                    >
                      {(u.displayName ?? u.email).slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {u.displayName ?? u.email}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <div>
                    <RoleBadge role={u.role} />
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                        u.status === "active" ? "text-emerald-300" : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.status === "active" ? "bg-emerald-400" : "bg-slate-600"
                        }`}
                      />
                      {u.status}
                    </span>
                  </div>
                  <p className="hidden text-[11px] text-slate-500 md:block">
                    {u.lastActive ? formatRelative(u.lastActive) : "—"}
                  </p>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setEditing(u)}
                      className="rounded-md p-2 text-slate-500 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                      title="Manage role"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-ink-900/40 px-4 py-3.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-slate-400">
              Demo data — the{" "}
              <code className="font-mono text-cyan-300">users</code> endpoints are
              not implemented on the backend yet. Wire{" "}
              <code className="font-mono text-cyan-300">GET /users</code> into{" "}
              <code className="font-mono text-cyan-300">lib/evidence-service.ts</code>{" "}
              to connect live records.
            </p>
          </div>
        </div>

        <Modal
          open={!!editing}
          onClose={() => setEditing(null)}
          title={`Manage ${editing?.displayName ?? editing?.email ?? "user"}`}
          icon={<UserCog className="h-4 w-4" />}
        >
          {editing && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Current role
                </p>
                <div className="mt-1.5">
                  <RoleBadge role={editing.role} />
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Assign role
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() =>
                        pending(`Assign role ${r.toUpperCase()}`)
                      }
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        editing.role === r
                          ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                          : "border-white/10 text-slate-400 hover:border-cyan-400/30 hover:text-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Account created {formatDateTime(editing.created_at)}. Role
                changes are audited in the custody ledger.
              </p>
              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => pending("Suspend user")}
              >
                Suspend Account
              </Button>
            </div>
          )}
        </Modal>
      </PageTransition>
    </AuthGuard>
  );
}