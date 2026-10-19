/** Tailwind config for the portfolio. Rebuild with: npm run build */
module.exports = {
  content: ["./index.html", "./assets/site.js"],
  theme: {
    extend: {
      colors: {
        night: "#0a0b10",   // page ground, the night sky
        panel: "#12141b",   // raised panels
        deep: "#07080c",    // inset areas
        bone: "#ece8e1",    // main text
        mist: "#a3a3ad",    // secondary text
        line: "rgb(236 232 225 / 0.12)",
        red: { DEFAULT: "#e0231c", hover: "#f03a2f", ember: "#ff5a3c" },
      },
      fontFamily: {
        sans: ['"Onest"', "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", '"SF Mono"', "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { wrap: "76rem" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        cue: { "0%,100%": { transform: "scaleX(.35)", transformOrigin: "left" }, "50%": { transform: "scaleX(1)", transformOrigin: "left" } },
      },
      animation: {
        rise: "rise .9s cubic-bezier(.2,.7,.2,1) both",
        cue: "cue 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
