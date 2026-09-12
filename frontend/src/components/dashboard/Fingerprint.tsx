"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export default function Fingerprint({
  hash,
  match = true,
}: {
  hash: string;
  match?: boolean;
}) {
  const cells = useMemo(() => {
    const out: number[] = [];
    const hex = hash.replace(/-/g, "");
    for (let i = 0; i < 128; i += 1) {
      const ch = hex[(i * 7) % hex.length] ?? "0";
      out.push(parseInt(ch, 16) % 8);
    }
    return out;
  }, [hash]);

  const COLS = 64;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.07] bg-ink-950/70 p-4">
      <div className="grid grid-cols-8 gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {cells.map((val, i) => {
          const col = i % COLS;
          const height = 4 + val * 3.2;
          const base = match ? [56, 189, 248] : [251, 113, 133];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleY: 0.2 }}
              whileInView={{ opacity: 1, scaleY: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: col * 0.006,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full rounded-[1px] origin-bottom"
              style={{
                height,
                background: `rgb(${base[0]},${base[1]},${base[2]})`,
                opacity: 0.35 + (val / 8) * 0.6,
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ top: "8%" }}
        animate={{ top: "88%" }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          repeatDelay: 1,
        }}
        className="pointer-events-none absolute inset-x-3 h-px"
        style={{
          background: match
            ? "linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent)"
            : "linear-gradient(90deg, transparent, rgba(251,113,133,0.5), transparent)",
        }}
      />
    </div>
  );
}