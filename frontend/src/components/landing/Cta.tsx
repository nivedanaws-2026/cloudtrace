import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { Reveal } from "@/components/ui/Motion";
import Button from "@/components/ui/Button";

export function Cta() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong px-6 py-14 text-center sm:px-14">
            <div className="absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-600/15 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 text-cyan-300">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Every Byte Counts.{" "}
                <span className="text-gradient">Make It Verified.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-400">
                Start securing digital evidence with cryptographic integrity and
                a tamper-evident chain of custody — powered by AWS and
                Kubernetes.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Explore Platform
                  </Button>
                </Link>
              </div>
              <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                JWT-secured · Role-based access · Zero backend secrets in the browser
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}