# Sumit Shinde portfolio

Plain HTML styled with Tailwind CSS. GitHub Pages serves `index.html` directly; no build runs on the server.

- `index.html` is the page. All styling is Tailwind utility classes.
- `assets/tailwind.css` is the compiled stylesheet. Rebuild it after changing classes:
  `npm install` once, then `npm run build` (or `npm run watch` while editing).
- `tailwind.config.js` holds the colours and fonts; `src/input.css` holds the colour values for light and dark mode and the self-hosted fonts.
- `assets/site.js` is a small script for the theme switch, the mobile menu, the name field and the email previews.
