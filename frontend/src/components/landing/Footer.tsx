import Link from "next/link";
import { ShieldCheck, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                CLOUD<span className="text-cyan-300">TRACE</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Digital Evidence Integrity, Secured by Design. Cryptographic
              fingerprints and an immutable chain of custody for every byte.
            </p>
          </div>

          <div className="flex gap-12 text-center md:text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Platform
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="transition hover:text-cyan-300">Features</a></li>
                <li><a href="#integrity" className="transition hover:text-cyan-300">Integrity</a></li>
                <li><a href="#trust" className="transition hover:text-cyan-300">Security</a></li>
                <li><a href="#architecture" className="transition hover:text-cyan-300">Architecture</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Access
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link href="/login" className="transition hover:text-cyan-300">Log In</Link></li>
                <li><Link href="/signup" className="transition hover:text-cyan-300">Sign Up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 md:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} CloudTrace. Cloud-native digital evidence management.
          </p>
          <div className="flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="rounded-md border border-white/[0.08] p-2 text-slate-500 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}