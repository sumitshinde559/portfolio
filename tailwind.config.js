/** Tailwind config for the portfolio. Rebuild with: npm run build */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
module.exports = {
  content: ["./index.html", "./assets/site.js"],
  darkMode: ["selector", '[data-theme-resolved="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        surface: v("surface"),
        sunken: v("sunken"),
        ink: v("ink"),
        muted: v("muted"),
        rule: v("rule"),
        teal: { DEFAULT: v("teal"), hover: v("teal-hover"), on: v("on-teal") },
        mint: v("mint"),
        tint: v("tint"),
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", '"SF Mono"', "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { wrap: "72rem" },
      boxShadow: { card: "0 1px 2px rgb(14 30 37 / 6%), 0 12px 32px -12px rgb(14 30 37 / 16%)" },
    },
  },
  plugins: [],
};
