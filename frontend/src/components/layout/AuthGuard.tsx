"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function AuthGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && roles && user && !roles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [status, user, roles, router, pathname]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.75, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600"
        >
          <ShieldCheck className="h-6 w-6 text-white" />
        </motion.div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Verifying session
        </p>
      </div>
    );
  }

  if (status === "authenticated" && roles && user && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}