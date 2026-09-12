"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileUp, X, Lock, FileWarning } from "lucide-react";
import type { FileMeta } from "@/lib/types";
import { formatBytes } from "@/lib/format";

export default function UploadZone({
  onFile,
  busy,
  progress,
}: {
  onFile: (file: File) => void;
  busy: boolean;
  progress: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<FileMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setError("File exceeds the 2 GB limit.");
      return;
    }
    setError(null);
    setPreview({ name: file.name, size: file.size, type: file.type });
    onFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    accept(e.dataTransfer.files?.[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        animate={{
          borderColor: dragging
            ? "rgba(34,211,238,0.55)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: dragging ? "rgba(34,211,238,0.05)" : "rgba(255,255,255,0.02)",
          scale: dragging ? 1.01 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onClick={() => {
          if (!busy) inputRef.current?.click();
        }}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          busy ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />
        <motion.div
          animate={dragging ? { y: -6 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/12 to-blue-600/10 text-cyan-300"
        >
          <UploadCloud className="h-7 w-7" />
        </motion.div>
        <div>
          <p className="font-display text-base font-semibold text-slate-100">
            {dragging ? "Release to upload" : "Drop digital evidence here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            or{" "}
            <span className="font-medium text-cyan-300">choose a file</span> from your device
          </p>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-ink-900/60 px-3 py-1 text-[11px] text-slate-500">
          <Lock className="h-3 w-3" />
          Max 2 GB · hashed with SHA-256 on ingest
        </p>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-sm text-rose-300">
          <FileWarning className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {preview && !busy && (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-900/60 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <FileUp className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">
              {preview.name}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatBytes(preview.size)}
            </p>
          </div>
          <button
            onClick={() => setPreview(null)}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {busy && (
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Uploading…</span>
            <span className="font-mono text-cyan-300">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}