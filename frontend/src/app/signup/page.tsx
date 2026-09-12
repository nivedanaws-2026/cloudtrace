"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useAuth, errorMessage } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Field, Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import PipelineVisual from "@/components/landing/PipelineVisual";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "investigator", label: "Investigator", hint: "Uploads and reviews evidence" },
  { value: "custodian", label: "Custodian", hint: "Manages custody actions" },
  { value: "auditor", label: "Auditor", hint: "Verifies integrity and audits" },
  { value: "admin", label: "Administrator", hint: "Manages users and the system" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("investigator");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address";
    }
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }
    if (confirm !== password) {
      next.confirm = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password, confirm]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;
      setLoading(true);
      try {
        await signup({ email, password, role });
        toast.success("Account created", "Sign in with your new credentials.");
        router.push("/login");
      } catch (error) {
        toast.error("Signup failed", errorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [validate, email, password, role, signup, toast, router],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_90%_40%,rgba(37,99,235,0.12),transparent)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center px-5 py-10 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center justify-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                CLOUD<span className="text-cyan-300">TRACE</span>
              </span>
            </Link>
          </div>

          <div className="rounded-2xl glass-strong p-7">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Join the CloudTrace evidence platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Email" htmlFor="email" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.io"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  invalid={!!errors.email}
                  autoComplete="email"
                />
              </Field>

              <Field label="Password" htmlFor="password" error={errors.password}>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  invalid={!!errors.password}
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Confirm Password" htmlFor="confirm" error={errors.confirm}>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  invalid={!!errors.confirm}
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Role" htmlFor="role">
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
                <p className="!mt-1 text-[11px] text-slate-500">
                  {ROLES.find((r) => r.value === role)?.hint}
                </p>
              </Field>

              <Button
                type="submit"
                className="w-full justify-center"
                loading={loading}
                icon={!loading ? <UserPlus className="h-4 w-4" /> : undefined}
              >
                Create Account
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-600">
            Your role determines what you can see and do.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden items-center justify-center lg:flex"
        >
          <PipelineVisual />
        </motion.div>
      </div>
    </div>
  );
}