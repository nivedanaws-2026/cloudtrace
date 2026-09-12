"use client";

import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

const baseField =
  "w-full rounded-lg border border-white/10 bg-ink-900/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors duration-200 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  children,
  hint,
  error,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-slate-400"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  className = "",
  invalid = false,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={`${baseField} ${invalid ? "border-rose-400/60" : ""} ${className}`}
      {...rest}
    />
  );
}

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${baseField} appearance-none ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} />;
}