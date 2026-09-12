"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function HashBox({
  hash,
  label,
  compact = false,
}: {
  hash: string;
  label?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      const el = document.createElement("textarea");
      el.value = hash;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="w-full rounded-xl border border-cyan-400/15 bg-ink-950/80">
      {label && (
        <div className="border-b border-white/5 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </div>
      )}
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <code
          className={`min-w-0 flex-1 break-all font-mono ${
            compact ? "text-[11px]" : "text-xs sm:text-sm"
          } leading-relaxed text-cyan-200`}
        >
          {hash}
        </code>
        <button
          onClick={copy}
          className="shrink-0 rounded-md border border-white/10 p-1.5 text-slate-400 transition hover:border-cyan-400/40 hover:text-cyan-300"
          aria-label="Copy hash"
          title="Copy hash"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}