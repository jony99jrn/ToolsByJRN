/* ==========================================================================
   Tools By JRN — app logic
   Reads window.TOOLS (populated by js/tools/*.js, which load before this
   file) and drives the hero search, category chips, bento tool grid, and
   theme toggle. No tool-specific data belongs in this file — add new tools
   in js/tools/ instead.
   ========================================================================== */
(function(){
"use strict";

const tools = window.TOOLS || [];

/* ===== HELPERS ===== */
const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>`;
const VARIANTS = ['t-ink', 't-sand', 't-paper'];

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* Bento sizing. Featured tools ask for half a row (6 of 12 columns), the
   rest ask for a third (4). When a row can't be filled exactly, its last
   tile stretches to close the gap, so the grid never has holes. */
function spansFor(list){
  const spans = [];
  let rowSum = 0;
  list.forEach((t, i) => {
    const want = t.featured ? 6 : 4;
    if(rowSum + want > 12){
      spans[i - 1] += 12 - rowSum;
      rowSum = 0;
    }
    spans.push(want);
    rowSum += want;
  });
  if(spans.length && rowSum < 12) spans[spans.length - 1] += 12 - rowSum;
  return spans;
}

function toolHTML(tool, i, span){
  return `
  <article class="tile tool ${VARIANTS[i % VARIANTS.length]}${span >= 8 ? ' wide' : ''}" style="--span:${span};--i:${i + 4}">
    <div class="plate">${tool.icon}</div>
    <div class="body">
      <span class="cat">${esc(tool.category)}</span>
      <h2><a href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer">${esc(tool.name)}<span class="sr"> (opens in a new tab)</span></a></h2>
      <p>${esc(tool.description)}</p>
    </div>
    <div class="go" aria-hidden="true"><span>Open tool</span><span class="chip-go">${ARROW}</span></div>
  </article>`;
}

/* ===== STATIC PIECES (built once from the tools list) ===== */
document.getElementById('plates').innerHTML =
  tools.slice(0, 4).map(t => `<div class="plate">${t.icon}</div>`).join('');

document.getElementById('countTitle').textContent =
  `${tools.length} tool${tools.length === 1 ? '' : 's'} and counting.`;

/* ===== CATEGORY CHIPS ===== */
const categories = ["All", ...new Set(tools.map(t => t.category))];
const chipsEl = document.getElementById('chips');
chipsEl.innerHTML = categories.map((cat, i) =>
  `<button class="chip" type="button" data-category="${esc(cat)}" aria-pressed="${i === 0}">${esc(cat)}</button>`
).join('');
let activeCategory = "All";

/* ===== SEARCH + FILTER LOGIC ===== */
const toolsEl = document.getElementById('tools');
const searchInput = document.getElementById('searchInput');
const searchBox = searchInput.closest('.search');
const searchClear = document.getElementById('searchClear');
const live = document.getElementById('live');

function matchesSearch(tool, term){
  if(!term) return true;
  return [tool.name, tool.description, tool.category, ...(tool.keywords || [])]
    .join(' ').toLowerCase().includes(term);
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
    toolsEl.innerHTML = `
      <div class="tile empty t-paper">
        <h2>No tools found.</h2>
        <p>${raw ? `Nothing matches “${esc(raw)}”. Try another keyword.` : 'Nothing in this category yet.'}</p>
        <button type="button" id="resetBtn">Show all tools</button>
      </div>`;
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    live.textContent = 'No tools found.';
    return;
  }

  const spans = spansFor(results);
  toolsEl.innerHTML = results.map((t, i) => toolHTML(t, i, spans[i])).join('');
  live.textContent = `${results.length} ${results.length === 1 ? 'tool' : 'tools'} shown.`;
}

function resetFilters(){
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
searchInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    toolsEl.scrollIntoView({behavior:'smooth'});
  }
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

/* ===== TYPED PLACEHOLDER (search tile, cycles example queries) ===== */
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

/* Entrance animation runs once, then gets out of the way of hover effects */
setTimeout(() => document.body.classList.remove('intro'), 1500);

})();
