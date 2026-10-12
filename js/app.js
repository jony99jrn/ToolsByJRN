/* ==========================================================================
   Tools By JRN — app logic
   Reads window.TOOLS (populated by js/tools/*.js, which load before this
   file) and drives the hero search, category chips, tool cards and theme
   toggle. No tool-specific data belongs in this file — add new tools in
   js/tools/ instead.
   ========================================================================== */
(function(){
"use strict";

const tools = window.TOOLS || [];

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;

/* ===== ELEMENTS ===== */
const searchInput = document.getElementById('searchInput');
const searchBox = searchInput.closest('.search');
const searchClear = document.getElementById('searchClear');
const chipsEl = document.getElementById('chips');
const gridEl = document.getElementById('tools');
const live = document.getElementById('live');

/* ===== STATIC PIECES (built once from the tools list) ===== */
document.getElementById('trustLine').textContent =
  `${tools.length} tool${tools.length === 1 ? '' : 's'} and counting. Free, no sign-up, no ads.`;

/* Decorative floating previews: the first three tools */
document.getElementById('floatStack').innerHTML = tools.slice(0, 3).map(t =>
  `<div class="glass mini"><div class="plate">${t.icon}</div>${esc(t.name)}</div>`
).join('');

/* ===== CATEGORY CHIPS ===== */
const categories = ["All", ...new Set(tools.map(t => t.category))];
chipsEl.innerHTML = categories.map((c, i) =>
  `<button class="chip" type="button" data-category="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`
).join('');
let activeCategory = "All";

/* ===== SEARCH + FILTER LOGIC ===== */
function matchesSearch(tool, term){
  if(!term) return true;
  return [tool.name, tool.description, tool.category, ...(tool.keywords || [])]
    .join(' ').toLowerCase().includes(term);
}

function cardHTML(t){
  return `
  <article class="glass card">
    <div class="plate">${t.icon}</div>
    <span class="cat">${esc(t.category)}</span>
    <h3><a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">${esc(t.name)}<span class="sr"> (opens in a new tab)</span></a></h3>
    <p>${esc(t.description)}</p>
    <span class="open" aria-hidden="true"><i>${ARROW}</i>Open tool</span>
  </article>`;
}

function renderTools(){
  const raw = searchInput.value.trim();
  const term = raw.toLowerCase();
  searchBox.classList.toggle('has-text', raw.length > 0);

  /* Array.sort is stable, so non-featured tools keep their load order */
  const results = tools
    .filter(t => (activeCategory === "All" || t.category === activeCategory) && matchesSearch(t, term))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  if(results.length === 0){
    gridEl.innerHTML = `
      <div class="glass empty">
        <h3>No tools found.</h3>
        <p>${raw ? `Nothing matches “${esc(raw)}”. Try another keyword.` : 'Nothing in this category yet.'}</p>
        <button type="button" id="resetBtn">Show all tools</button>
      </div>`;
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    live.textContent = 'No tools found.';
    return;
  }
  gridEl.innerHTML = results.map(cardHTML).join('');
  live.textContent = `${results.length} ${results.length === 1 ? 'tool' : 'tools'} shown.`;
}

function resetAll(){
  searchInput.value = '';
  activeCategory = "All";
  chipsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.category === "All"));
  renderTools();
}

chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.chip');
  if(!btn) return;
  activeCategory = btn.dataset.category;
  chipsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === btn));
  renderTools();
});
searchInput.addEventListener('input', renderTools);
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  renderTools();
});
function jumpToTools(){ gridEl.scrollIntoView({behavior:'smooth'}); }
document.getElementById('launchBtn').addEventListener('click', jumpToTools);
searchInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') jumpToTools();
  if(e.key === 'Escape'){ searchInput.value = ''; renderTools(); }
});
renderTools();

/* "/" focuses search from anywhere, unless already typing in a field */
document.addEventListener('keydown', (e) => {
  if(e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = document.activeElement.tagName;
  if(tag === 'INPUT' || tag === 'TEXTAREA') return;
  e.preventDefault();
  searchInput.focus();
});

/* ===== TYPED PLACEHOLDER (hero search, cycles example queries) ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const examples = ["Search tools…", "Try ‘merge pdf’", "Try ‘cover page’"];
if(!reduceMotion){
  let exIndex = 0, charIndex = 0, deleting = false;
  const cyclePlaceholder = function(){
    if(document.activeElement === searchInput || searchInput.value){
      setTimeout(cyclePlaceholder, 600);
      return;
    }
    const current = examples[exIndex];
    searchInput.placeholder = deleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);
    let delay = deleting ? 35 : 65;
    if(!deleting && charIndex > current.length){ delay = 1400; deleting = true; }
    else if(deleting && charIndex < 0){ deleting = false; exIndex = (exIndex + 1) % examples.length; charIndex = 0; delay = 300; }
    setTimeout(cyclePlaceholder, delay);
  };
  cyclePlaceholder();
}

/* ===== THEME TOGGLE ===== */
document.getElementById('themeToggle').addEventListener('click', () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try{ localStorage.setItem('tbj-theme', next); }catch(e){}
});

})();
