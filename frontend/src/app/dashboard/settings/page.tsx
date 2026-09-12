"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserRound,
  Settings as SettingsIcon,
  KeyRound,
  Bell,
  Database,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { RoleBadge } from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { PageTransition } from "@/components/ui/Motion";
import { API_URL } from "@/lib/api";

function Toggle({ label, desc, toggled }: { label: string; desc: string; toggled?: boolean }) {
  const [on, setOn] = useState(toggled ?? false);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${
          on ? "bg-cyan-500/70" : "bg-white/10"
        }`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(API_URL);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const placeholder = () =>
    toast.info("Coming soon", "This setting is a UI placeholder until the backend endpoint ships.");

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">
            Settings
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage your profile, security preferences, and platform configuration.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 md:col-span-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-cyan-300" />
              <h3 className="font-display text-sm font-semibold text-slate-100">Profile</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 font-display text-lg font-bold text-cyan-200">
                {user?.email.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-100">{user?.email}</p>
                <p className="text-xs text-slate-500">
                  Authenticated via JWT · valid session
                </p>
                {user && (
                  <div className="mt-2">
                    <RoleBadge role={user.role} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-cyan-300" />
              <h3 className="font-display text-sm font-semibold text-slate-100">Security</h3>
            </div>
            <div className="space-y-3.5">
              <Field label="Current password" htmlFor="cur-pass">
                <Input id="cur-pass" type="password" placeholder="••••••••" />
              </Field>
              <Field label="New password" htmlFor="new-pass">
                <Input id="new-pass" type="password" placeholder="Minimum 8 characters" />
              </Field>
              <Button variant="secondary" size="sm" onClick={placeholder}>
                Update Password
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-300" />
              <h3 className="font-display text-sm font-semibold text-slate-100">Notifications</h3>
            </div>
            <div className="divide-y divide-white/[0.05]">
              <Toggle label="Integrity mismatch alerts" desc="Email when a verification fails" toggled />
              <Toggle label="Custody event notifications" desc="When evidence changes hands" toggled />
              <Toggle label="Weekly audit digest" desc="Every Monday at 08:00" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="glass rounded-2xl p-5 md:col-span-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-300" />
              <h3 className="font-display text-sm font-semibold text-slate-100">
                API Configuration
              </h3>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-ink-950/60 px-3.5 py-2.5">
              <p className="truncate font-mono text-xs text-cyan-200">{API_URL}</p>
              <button
                onClick={copyUrl}
                className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:text-cyan-300"
                aria-label="Copy API URL"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
              <SettingsIcon className="h-3 w-3" />
              Reads from <code className="font-mono text-cyan-300/80">NEXT_PUBLIC_API_URL</code>.
              No backend secrets are ever exposed to the browser.
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}