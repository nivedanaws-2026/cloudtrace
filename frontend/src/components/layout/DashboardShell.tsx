"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid,
  UploadCloud,
  Link2,
  Users,
  Clock3,
  ScanSearch,
  Scale,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { roleColors, roleLabel } from "@/lib/auth-store";
import type { Role } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: Role[];
}

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <LayoutGrid className="h-4 w-4" />,
    roles: ["admin", "investigator", "custodian", "auditor"],
  },
  {
    href: "/dashboard/pending-approvals",
    label: "Pending Approvals",
    icon: <Clock3 className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    href: "/dashboard/users",
    label: "All Users",
    icon: <Users className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    href: "/dashboard/all-evidence",
    label: "All Evidence",
    icon: <Scale className="h-4 w-4" />,
    roles: ["admin", "auditor"],
  },
  {
    href: "/dashboard/custody-chain",
    label: "Custody Chain Viewer",
    icon: <Link2 className="h-4 w-4" />,
    roles: ["auditor"],
  },
  {
    href: "/dashboard/my-evidence",
    label: "My Evidence",
    icon: <Scale className="h-4 w-4" />,
    roles: ["investigator", "custodian"],
  },
  {
    href: "/dashboard/upload",
    label: "Upload Evidence",
    icon: <UploadCloud className="h-4 w-4" />,
    roles: ["investigator", "custodian"],
  },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/pending-approvals": "Pending Approvals",
  "/dashboard/users": "All Users",
  "/dashboard/all-evidence": "All Evidence",
  "/dashboard/custody-chain": "Custody Chain Viewer",
  "/dashboard/my-evidence": "My Evidence",
  "/dashboard/upload": "Upload Evidence",
};

const ROLE_SUBTITLES: Record<Role, string> = {
  admin: "Full visibility · approve users & assign roles",
  investigator: "Upload and verify your own evidence",
  custodian: "Handle custody of your evidence items",
  auditor: "Read-only · full compliance visibility",
};

function NavLinks({
  role,
  onNavigate,
}: {
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
              active
                ? "bg-cyan-400/10 text-cyan-200"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`nav-${item.href}`}
                className="absolute inset-0 rounded-lg border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.08] to-transparent"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative z-10">{item.icon}</span>
            <span className="relative z-10">{item.label}</span>
            {active && (
              <ChevronRight className="relative z-10 ml-auto h-3.5 w-3.5 opacity-60" />
            )}
          </Link>
        );
      })}
    </>
  );
}

function ProfileFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = useCallback(() => {
    logout();
    toast.info("Signed out", "Your session has been closed.");
  }, [logout, toast]);

  if (!user) return null;

  return (
    <div className="border-t border-white/[0.06] p-3">
      <div className="rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
              roleColors[user.role]
            }`}
          >
            {user.email.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-200">
              {user.email}
            </p>
            <p
              className={`inline-flex items-center rounded border px-1.5 py-px text-[9px] font-bold uppercase tracking-widest ${
                roleColors[user.role]
              }`}
            >
              {roleLabel(user.role)}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="rounded-md p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const title = useMemo(() => {
    if (pathname.startsWith("/dashboard/evidence/")) return "Evidence Details";
    return TITLES[pathname] ?? "CloudTrace";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ink-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-ink-900/80 backdrop-blur-2xl lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              CLOUD<span className="text-cyan-300">TRACE</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {user && <NavLinks role={user.role} />}
        </nav>
        <ProfileFooter />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-ink-900/95 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-display text-base font-bold tracking-tight text-white">
                    CLOUD<span className="text-cyan-300">TRACE</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {user && (
                  <NavLinks role={user.role} onNavigate={() => setMobileOpen(false)} />
                )}
              </nav>
              <ProfileFooter onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-ink-950/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-slate-300 hover:bg-white/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-sm font-semibold text-slate-100 sm:text-base">
              {title}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Signed in as
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      roleColors[user.role].split(" ")[0]
                    }`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${roleColors[user.role]}`}
                >
                  {user.email.slice(0, 1).toUpperCase()}
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Role subtitle strip */}
      {user && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-20 hidden rounded-full border border-white/[0.06] bg-ink-900/80 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-widest text-slate-500 backdrop-blur-xl lg:block">
          {ROLE_SUBTITLES[user.role]}
        </div>
      )}
    </div>
  );
}