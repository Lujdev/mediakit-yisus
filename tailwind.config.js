/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#0A0A0A",
        "bg-secondary": "#161616",
        "accent-lime": "#D4F23A",
        "accent-orange": "#FF7A3D",
        "text-primary": "#F5F5F0",
        "text-secondary": "#B4B4B0",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-bebas-neue)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
