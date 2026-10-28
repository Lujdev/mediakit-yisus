/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Colours are CSS variables (see globals.css) so a theme change needs no class swaps.
      colors: {
        "bg-primary": "rgb(var(--bg-primary) / <alpha-value>)",
        "bg-secondary": "rgb(var(--bg-secondary) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        // Brand lime as a fill (buttons, lit rows); dark text goes on it via on-accent.
        "accent-lime": "rgb(var(--accent-lime) / <alpha-value>)",
        "accent-orange": "rgb(var(--accent-orange) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
        // Lime as text / thin lines: stays lime on dark, becomes deep olive on light.
        "accent-ink": "rgb(var(--accent-ink) / <alpha-value>)",
        // Hairlines and washes: white on dark, ink on light.
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        display: ["var(--font-bebas-neue)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
