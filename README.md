# Tools By JRN

A clean, lightweight homepage that acts as a central directory for student tools built by JRN — like a mini SaaS tool hub for campus life.

**Live tools linked from this page:**

- [Merge PDF](https://merge-pdf-two.vercel.app/) — combine multiple PDFs into one document
- [DIU Cover Page](https://diu-cover-page-omega.vercel.app/) — generate a DIU assignment cover page

This page is a **directory**, not the tools themselves — each card links out to its own external site in a new tab.

## Tech

Plain HTML, CSS, and JavaScript — a single self-contained `index.html` file. No frameworks, no build step, no dependencies.

## Features

- Light/dark theme toggle — remembers your choice, and follows your system preference on first visit
- Search-first hero — typing filters the tools grid live, no separate search section
- Category filter chips, generated automatically from whatever categories your tools use
- `/` keyboard shortcut jumps straight to the search box
- Sticky navbar with a mobile hamburger menu
- Fully responsive (360px and up), keyboard accessible, visible focus states
- Respects `prefers-reduced-motion`

## Project structure

```
index.html   ← everything: markup, styles, script, and all tool icons (inline SVG)
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
    icon: `<svg>...</svg>`,   // inline SVG markup, use fill="currentColor" so it adapts to the theme
    keywords: ["keyword1", "keyword2"],
    featured: false            // optional — shows a "Featured" badge on the card
  },
  // ...existing tools
];
```

Add a new object to the array — the search, category chips, and grid all update automatically. No other code changes needed.

## Deployment

This is a static site, so it deploys anywhere that serves static files:

**GitHub Pages**

1. Push `index.html` to a repo (e.g. as the only file, or inside a `docs/` folder).
2. In the repo settings, enable GitHub Pages for that branch/folder.

**Vercel**

1. Import the repo into Vercel (or drag-and-drop deploy).
2. No build command needed — it's a static `index.html`.

## Color palette

**Light**

| Role       | Hex       |
| ---------- | --------- |
| Background | `#FAF3E1` |
| Surface    | `#FFFFFF` |
| Text       | `#221F19` |
| Accent     | `#FA8112` |

**Dark**

| Role       | Hex       |
| ---------- | --------- |
| Background | `#15130E` |
| Surface    | `#211C15` |
| Text       | `#F4EDDC` |
| Accent     | `#FF9C42` |

## License

© 2026 JRN. All rights reserved.
