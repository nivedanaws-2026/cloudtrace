"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

/**
 * Client-side UX guard: hides content and bumps users back to the dashboard
 * when their role isn't in the allowed list. Real enforcement stays on the
 * backend — this only makes navigation feel correct.
 */
export default function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: ReactNode;
}) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "authenticated" && user && !allow.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [status, user, allow, router, pathname]);

  if (status !== "authenticated" || !user) return null;
  if (!allow.includes(user.role)) return null;

  return <>{children}</>;
}