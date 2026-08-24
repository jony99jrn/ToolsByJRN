# Tools By JRN

A clean, lightweight homepage that acts as a central directory for student tools built by JRN — like a mini SaaS tool hub for campus life.

**Live tools linked from this page:**

- [Merge PDF](https://merge-pdf-two.vercel.app/) — combine multiple PDFs into one document
- [DIU Cover Page](https://diu-cover-page-omega.vercel.app/) — generate a DIU assignment cover page

This page is a **directory**, not the tools themselves — each card links out to its own external site in a new tab.

## Tech

Plain HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies — just static files.

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
index.html            ← page markup only
css/
└── styles.css         ← all styling, incl. light/dark theme variables
js/
├── icons.js           ← every tool's SVG icon, one constant each
├── app.js             ← search, filters, chips, theme toggle, mobile menu
└── tools/             ← one file per tool
    ├── merge-pdf.js
    └── diu-cover-page.js
```

Scripts are loaded as plain `<script src="">` tags in a fixed order — `icons.js`, then each file in `js/tools/`, then `app.js` last. Each tool file registers itself into a shared list that `app.js` reads to build the page; no bundler needed.

## Adding a new tool

1. Add the tool's icon to `js/icons.js` as a new `const` (inline SVG, `fill="currentColor"` so it adapts to the theme).
2. Create a new file in `js/tools/`, e.g. `js/tools/my-tool.js`:

   ```js
   window.TOOLS = window.TOOLS || [];

   window.TOOLS.push({
     name: "Tool Name",
     description: "Short one-line description.",
     category: "Category Name",
     url: "https://your-tool-url.com/",
     icon: ICON_MY_TOOL,
     keywords: ["keyword1", "keyword2"],
     featured: false            // optional — shows a "Featured" badge
   });
   ```

3. Add one line in `index.html`, before the `app.js` script tag:

   ```html
   <script src="js/tools/my-tool.js"></script>
   ```

That's it — the search, category chips, and grid all pick it up automatically.

## Deployment

This is a static site, so it deploys anywhere that serves static files:

**GitHub Pages**

1. Push the repo (with the structure above at the root).
2. In the repo settings, enable GitHub Pages for that branch/folder.

**Vercel**

1. Import the repo into Vercel (or drag-and-drop deploy).
2. No build command needed — it's all static files.

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
