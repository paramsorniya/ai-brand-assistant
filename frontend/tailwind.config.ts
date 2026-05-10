import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#12121A",
        surfaceHover: "#1A1A28",
        border: "#1E1E2E",
        accent: "#6C63FF",
        accentHover: "#5A52E8",
        textPrimary: "#F0F0FF",
        textSecondary: "#8888AA",
        success: "#4ADE80",
        danger: "#FB7185",
      },
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        accent: "0 20px 40px rgba(108, 99, 255, 0.18)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typing: {
          "0%, 80%, 100%": { transform: "scale(0.75)", opacity: "0.45" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        fieldPulse: {
          "0%": { boxShadow: "0 0 0 rgba(108, 99, 255, 0)" },
          "20%": { boxShadow: "0 0 0 1px rgba(108, 99, 255, 0.55)" },
          "100%": { boxShadow: "0 0 0 rgba(108, 99, 255, 0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease both",
        typing: "typing 1s infinite ease-in-out",
        "field-pulse": "fieldPulse 1.4s ease",
      },
    },
  },
  plugins: [],
} satisfies Config;
