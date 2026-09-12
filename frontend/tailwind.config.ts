import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04060e",
          900: "#070b17",
          850: "#0a1120",
          800: "#0d1526",
          750: "#101a30",
          700: "#16203a",
          600: "#1e2b4a",
        },
        brand: {
          DEFAULT: "#22d3ee",
          dim: "#38bdf8",
          deep: "#2563eb",
          navy: "#0ea5e9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 48px -8px rgba(34,211,238,0.45)",
        "glow-sm": "0 0 22px -6px rgba(34,211,238,0.4)",
        panel: "0 24px 70px -24px rgba(0,0,0,0.75)",
        "panel-lg": "0 40px 120px -40px rgba(0,0,0,0.85)",
      },
    },
  },
  plugins: [],
};

export default config;