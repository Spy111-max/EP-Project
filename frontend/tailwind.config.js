/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#dbe7ff",
          200: "#bfd6ff",
          300: "#8cb8ff",
          400: "#5f93f4",
          500: "#2563EB",
          600: "#1f4ebd",
          700: "#1B365D",
          800: "#172b49",
          900: "#13243b",
        },
        stable: { 600: "#059669", 700: "#047857" },
        warning: { 600: "#D97706", 700: "#B45309" },
        danger: { 600: "#DC2626", 700: "#B91C1C" },
      },
      boxShadow: {
        card: "0 8px 24px -18px rgba(15, 23, 42, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
