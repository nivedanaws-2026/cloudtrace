"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  hover?: boolean;
  strong?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
  strong = false,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -4, borderColor: "rgba(34,211,238,0.28)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={`rounded-2xl ${strong ? "glass-strong" : "glass"} ${
        hover ? "card-hover hover:shadow-glow-sm" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}