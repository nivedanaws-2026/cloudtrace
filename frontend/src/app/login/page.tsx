"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth, errorMessage } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Field, Input } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import PipelineVisual from "@/components/landing/PipelineVisual";

function LoginForm() {
  const search = useSearchParams();
  const { login, status, user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(search.get("next") ?? "/dashboard");
    }
  }, [status, user, router, search]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        await login(email, password, remember);
        toast.success("Welcome back", "Session authenticated.");
      } catch (error) {
        toast.error("Login failed", errorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [email, password, remember, login, toast],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_40%,rgba(14,165,233,0.12),transparent)]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center px-5 py-10 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* Left branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="hidden items-center justify-center gap-8 lg:flex"
        >
          <PipelineVisual />
        </motion.div>

        {/* Right form card */}
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
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Sign in to your CloudTrace account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.io"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              <div className="flex items-center gap-3 py-1">
                <label className="relative inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-4 w-4 rounded border border-white/20 bg-ink-900 transition checked:bg-cyan-500 peer-checked:border-cyan-400/80" />
                  <span className="text-xs text-slate-400">Remember me</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full justify-center"
                loading={loading}
                icon={!loading ? <LogIn className="h-4 w-4" /> : undefined}
              >
                Sign In
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-600">
            JWT-secured · Role-based access · AWS IAM-controlled
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink-950">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Loading…
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}