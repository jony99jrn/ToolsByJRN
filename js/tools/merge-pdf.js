/* ==========================================================================
   Tool: Merge PDF
   Live at: https://merge-pdf-two.vercel.app/
   Registers itself into the shared window.TOOLS array â€” js/app.js reads
   that array to build the search, filters, and grid. Order of tools on the
   page follows the order these files are loaded in index.html.
   ========================================================================== */

window.TOOLS = window.TOOLS || [];

window.TOOLS.push({
  name: "Merge PDF",
  description: "Combine multiple PDF files into one document quickly and easily.",
  category: "PDF Tools",
  url: "https://merge-pdf-two.vercel.app/",
  icon: ICON_PDF,
  keywords: ["pdf", "merge", "combine", "document", "files"],
  featured: true
});
