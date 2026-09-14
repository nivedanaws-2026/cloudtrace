import type { ReactNode } from "react";
import type { IntegrityStatus, Role } from "@/lib/types";
import { roleColors, roleLabel } from "@/lib/auth-store";
import { ShieldCheck, ShieldAlert, HelpCircle } from "lucide-react";

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_META: Record<IntegrityStatus, { label: string; icon: ReactNode; cls: string }> = {
  intact: {
    label: "Integrity Intact",
    icon: <ShieldCheck className="h-3 w-3" />,
    cls: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  mismatch: {
    label: "Mismatch Detected",
    icon: <ShieldAlert className="h-3 w-3" />,
    cls: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  },
  unverified: {
    label: "Unverified",
    icon: <HelpCircle className="h-3 w-3" />,
    cls: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  },
};

export function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.unverified;
  return (
    <Badge className={meta.cls}>
      {meta.icon}
      {meta.label}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge className={roleColors[role]}>
      {roleLabel(role)}
    </Badge>
  );
}