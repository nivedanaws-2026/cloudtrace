"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export default function AnimatedCounter({
  value,
  className = "",
  format = (v: number) => v.toLocaleString(),
  duration = 1.4,
  startOnMount = true,
}: {
  value: number;
  className?: string;
  format?: (v: number) => string;
  duration?: number;
  startOnMount?: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!startOnMount) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, duration, startOnMount]);

  return <span className={className}>{format(display)}</span>;
}