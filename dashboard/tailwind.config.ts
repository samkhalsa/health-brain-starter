import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0e",
        surface: "#111318",
        card: "#171a21",
        border: "#232832",
        fg: "#e8eaed",
        muted: "#7a8699",
        accent: "#4ade80",
        recovery: {
          red: "#ef4444",
          yellow: "#f59e0b",
          green: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
