"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  UserPlus,
  Hourglass,
  Eye,
  EyeOff,
  MailCheck,
} from "lucide-react";
import { useAuth, errorMessage } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import PipelineVisual from "@/components/landing/PipelineVisual";

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
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
        const created = await signup({ email, password });
        setCreatedEmail(created.email);
      } catch (error) {
        toast.error("Signup failed", errorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [validate, email, password, signup, toast],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_90%_40%,rgba(37,99,235,0.12),transparent)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center px-5 py-10 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {createdEmail ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-2xl glass-strong p-7 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 shadow-glow-sm"
              >
                <MailCheck className="h-8 w-8" />
              </motion.div>

              <h1 className="mt-5 font-display text-xl font-bold tracking-tight text-white">
                Account created
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {createdEmail && (
                  <span className="mb-2 block font-mono text-cyan-300">
                    {createdEmail}
                  </span>
                )}
                An administrator must approve your account before you can log in.
              </p>

              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3.5 py-3 text-left text-xs leading-relaxed text-amber-200">
                <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                Your account is now pending approval. You will be able to sign in
                as soon as an administrator activates and assigns your role.
              </div>

              <Link href="/login" className="mt-6 block">
                <Button className="w-full justify-center">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
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

              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3.5 py-3 text-xs leading-relaxed text-cyan-200">
                <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                New accounts have no access until an administrator approves them
                and assigns your role.
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
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      invalid={!!errors.password}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
              Your role determines what you can see and do after approval.
            </p>
          </motion.div>
        )}

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