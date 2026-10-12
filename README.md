# Tools By JRN

A simple hub that links to free student utility tools made by Jony Roy. Each tool is its own small website. This hub lists them in one place with search and category filters.

Live site: https://toolbyjrn.vercel.app

## Tools

| Tool | What it does |
|------|--------------|
| PDF Compressor | Shrink PDFs up to 50 MB, or fit them under an upload size limit |
| Merge PDF | Combine multiple PDF files into one |
| Image to PDF | Convert images into a PDF |
| DIU Cover Page | Assignment cover page generator |
| DIU Lab Cover Page | Lab report cover page generator |

## Project structure

```
index.html            Page markup and script tags
manifest.json         Web app manifest
sw.js                 Service worker (offline support)
icon-192.png          App icons
icon-512.png
css/styles.css        Styles
js/icons.js           One SVG icon constant per tool (ICON_...)
js/app.js             Renders the cards, search and category filters
js/tools/*.js         One small file per tool (its card details)
```

## How it works

- Every file in `js/tools/` adds one object to the shared `window.TOOLS` array.
- `js/app.js` reads that array and builds the cards, the category chips and the search.
- Search looks at each tool's name, description, category and keywords.
- A card shows a "Featured" badge when `featured` is `true`.
- Each card opens the tool's own website in a new tab. The hub itself has no routing.
- **Card order** follows the order of the script tags in `index.html`.

### Tool object

```js
window.TOOLS = window.TOOLS || [];

window.TOOLS.push({
  name: "PDF Compressor",
  description: "Shrink PDFs or fit them under an upload size limit.",
  category: "PDF Tools",
  url: "https://pdf-compressors.vercel.app/",
  icon: ICON_pdfcompressor,
  keywords: ["pdf", "compress", "compressor", "reduce", "shrink", "size", "smaller", "document", "files"],
  featured: true
});
```

| Key | Meaning |
|-----|---------|
| `name` | Title on the card |
| `description` | One short line under the title |
| `category` | Groups tools into filter chips (new categories appear automatically) |
| `url` | The tool's live website |
| `icon` | An `ICON_...` constant from `js/icons.js` |
| `keywords` | Extra search words (not shown on the card) |
| `featured` | `true` shows a "Featured" badge |

## Adding a new tool

1. **Build and deploy the tool** as its own project (for example on Vercel) and copy its live URL.
2. **Add an icon** in `js/icons.js` as a new constant, for example `const ICON_mytool = \`<svg ...>...</svg>\`;`. Use `fill="currentColor"` and a `viewBox` so it follows the theme.
3. **Create `js/tools/mytool.js`** with a `window.TOOLS.push({ ... })` object like the one above.
4. **Add a script tag in `index.html`**, after `js/icons.js` and before `js/app.js`:

   ```html
   <script src="js/tools/mytool.js"></script>
   ```

5. **Add the file to `sw.js`.** Put `'/js/tools/mytool.js',` in the `CORE` list so it also works offline. You do not need to change the cache name.
6. **Commit to `main`.** Vercel redeploys automatically.
7. **Check the hub.** Hard refresh (Ctrl+Shift+R), then confirm the card, icon and link, and search for one of its keywords. A private window shows what a new visitor sees.

## Service worker (offline support)

`sw.js` caches the core files so the hub still opens without a connection.

- **Pages, `.js`, `.css` and `.json` files** are fetched **network-first**. Updates show up right away, and the saved copy is only used when the network fails.
- **Everything else** (images and icons) is **cache-first**.
- Because scripts are network-first, you do **not** need to bump the cache name when you edit `icons.js`, `app.js` or a tool file.
- The cache name (`toolsbyjrn-v2`) only needs to change if you want to clear old saved files from visitors' browsers, such as a replaced image.
- If a file in the `CORE` list is missing from the repo, the service worker fails to install. Keep that list matching the real files.

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| A new card does not show | The `ICON_` name matches `icons.js`, the script tag is in `index.html` before `app.js`, and the browser console (F12) shows no errors |
| Old version still showing | Hard refresh, or in the browser tools go to Application, Service Workers, Unregister, then reload |
| Card shows but the icon is missing or huge | The SVG has a `viewBox` and uses `fill="currentColor"` |
| Search does not find a tool | Add more words to its `keywords` |

## Brand colors

| Use | Color |
|-----|-------|
| Accent | `#FA8112` |
| Background | `#FAF3E1` |

Tool icons use these colors so every card looks consistent.

## Deploy

The hub is a static site deployed on Vercel from the `main` branch. No build step is needed. Each tool is deployed separately and linked from here.

## Credits

Made by Jony Roy (GitHub: [jony99jrn](https://github.com/jony99jrn)).
