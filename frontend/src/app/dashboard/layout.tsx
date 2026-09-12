import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthGuard from "@/components/layout/AuthGuard";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: {
    template: "%s · CloudTrace",
    default: "Dashboard · CloudTrace",
  },
  description: "CloudTrace secure dashboard — manage digital evidence and chain of custody.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}