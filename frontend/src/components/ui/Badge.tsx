import type { ReactNode } from "react";
import type { IntegrityStatus, Role } from "@/lib/types";
import { roleColors, roleLabel } from "@/lib/auth-store";
import { ShieldAlert, ShieldCheck } from "lucide-react";

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

export function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  const intact = status === "intact";
  return (
    <Badge
      className={
        intact
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/25 bg-rose-400/10 text-rose-300"
      }
    >
      {intact ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <ShieldAlert className="h-3 w-3" />
      )}
      {intact ? "Integrity Intact" : "Integrity Compromised"}
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