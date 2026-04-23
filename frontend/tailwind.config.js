/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: "0 8px 30px rgba(2, 6, 23, 0.08)",
        card: "0 10px 30px rgba(2, 6, 23, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      colors: {
        brand: {
          primary: "#4F46E5",
          primary2: "#2563EB",
          accent: "#10B981",
          accent2: "#14B8A6",
          slate0: "#020617",
          slate1: "#0F172A",
          slate2: "#334155",
          muted: "#64748B",
          bg: "#F8FAFC",
          panel: "#F1F5F9",
        },
      },
    },
  },
  plugins: [typography],
};

