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
        "bg-secondary": "#2A2A2A",
        "accent-lime": "#C8FF00",
        "accent-orange": "#FF6B35",
        "text-primary": "#F5F5F0",
        "text-secondary": "#A0A0A0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas-neue)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
