# Tools By JRN

A clean, lightweight homepage that acts as a central directory for student tools built by JRN — like a mini SaaS tool hub for campus life.

**Live tools linked from this page:**
- [Merge PDF](https://merge-pdf-two.vercel.app/) — combine multiple PDFs into one document
- [DIU Cover Page](https://diu-cover-page-omega.vercel.app/) — generate a DIU assignment cover page
- [PPTX to PDF](https://pptx2pdf.vercel.app/) — converts your pptx file into pdf file

This page is a **directory**, not the tools themselves — each card links out to its own external site in a new tab.

## Tech

Plain HTML, CSS, and JavaScript — a single self-contained `index.html` file. No frameworks, no build step, no dependencies.

## Features

- Sticky navbar with a mobile hamburger menu
- Typing animation on the hero title (respects `prefers-reduced-motion`)
- Instant search across tool name, description, category, and keywords
- Category filters that work together with search
- Featured Tools + a full, dynamically-rendered All Tools grid
- Fully responsive (360px and up), keyboard accessible, visible focus states

## Project structure

```
index.html   ← everything: markup, styles, script, and both tool icons (inline SVG)
```

## Adding a new tool

All tool data lives in one array near the top of the `<script>` block in `index.html`:

```js
const tools = [
  {
    name: "Tool Name",
    description: "Short one-line description.",
    category: "Category Name",
    url: "https://your-tool-url.com/",
    icon: `<svg>...</svg>`,   // inline SVG markup
    keywords: ["keyword1", "keyword2"],
    featured: true            // optional — shows it in the Featured section
  },
  // ...existing tools
];
```

Add a new object to the array — the search, filters, Featured section, and All Tools grid all update automatically. No other code changes needed.

## Deployment

This is a static site, so it deploys anywhere that serves static files:

**GitHub Pages**
1. Push `index.html` to a repo (e.g. as the only file, or inside a `docs/` folder).
2. In the repo settings, enable GitHub Pages for that branch/folder.

**Vercel**
1. Import the repo into Vercel (or drag-and-drop deploy).
2. No build command needed — it's a static `index.html`.

## Color palette

| Role | Hex |
|---|---|
| Background | `#FAF3E1` |
| Text | `#222222` |
| Accent | `#FA8112` |
| Surface | `#F5E7C6` |

## License

© 2026 JRN. All rights reserved.