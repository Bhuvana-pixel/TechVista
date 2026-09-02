import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f8fafc", // slate-50
        surface: "#ffffff",
        "surface-raised": "#f1f5f9", // slate-100
        "surface-border": "#e2e8f0", // slate-200
        primary: {
          DEFAULT: "#2563eb", // vibrant royal blue
          dark: "#1d4ed8",
          light: "#3b82f6",
          subtle: "#eff6ff",
        },
        accent: {
          DEFAULT: "#7c3aed", // violet
          violet: "#8b5cf6",
          cyan: "#0284c7",
          subtle: "#f5f3ff",
        },
        success: {
          DEFAULT: "#059669",
          light: "#10b981",
          subtle: "#ecfdf5",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#f59e0b",
          subtle: "#fffbeb",
        },
        danger: {
          DEFAULT: "#e11d48",
          light: "#f43f5e",
          subtle: "#fff1f2",
        },
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
        "glow-blue": "0 0 25px -4px rgba(37, 99, 235, 0.18)",
      }
    },
  },
  plugins: [],
};
export default config;
