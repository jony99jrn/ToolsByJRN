/* ==========================================================================
   Tools By JRN — app logic
   Reads window.TOOLS (populated by js/tools/*.js, which load before this
   file) and drives the finder: search box, category flags, tool list,
   preview pane, keyboard control and the theme toggle. No tool-specific
   data belongs in this file — add new tools in js/tools/ instead.
   ========================================================================== */
(function(){
"use strict";

const tools = window.TOOLS || [];

function esc(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function host(url){
  try{ return new URL(url).hostname; }catch(e){ return url; }
}

/* ===== ELEMENTS ===== */
const searchInput = document.getElementById('searchInput');
const queryBox = searchInput.closest('.query');
const searchClear = document.getElementById('searchClear');
const countEl = document.getElementById('count');
const chipsEl = document.getElementById('chips');
const listEl = document.getElementById('list');
const previewEl = document.getElementById('preview');
const live = document.getElementById('live');

/* ===== STATIC TEXT ===== */
document.getElementById('statusLine').textContent =
  `${tools.length} tool${tools.length === 1 ? '' : 's'} and counting. Free, no sign-up, no ads.`;

/* ===== CATEGORY FLAGS ===== */
const categories = ["All", ...new Set(tools.map(t => t.category))];
chipsEl.innerHTML = categories.map((c, i) =>
  `<button class="flag" type="button" data-category="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`
).join('');
let activeCategory = "All";

/* ===== STATE ===== */
let results = [];
let sel = 0;
let moved = false;   // true once the person has moved the selection by keyboard

function matchesSearch(tool, term){
  if(!term) return true;
  return [tool.name, tool.description, tool.category, ...(tool.keywords || [])]
    .join(' ').toLowerCase().includes(term);
}

/* ===== RENDER ===== */
function rowHTML(t, i){
  return `
  <a class="row" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" data-i="${i}">
    <span class="mk" aria-hidden="true">&gt;</span>
    <span class="nm">${esc(t.name)}<span class="sr"> (opens in a new tab)</span></span>
    <span class="ct">${esc(t.category)}</span>
    <span class="rd">${esc(t.description)}</span>
  </a>`;
}

function renderPreview(){
  const t = results[sel];
  if(!t){ previewEl.className = 'preview none'; previewEl.innerHTML = ''; return; }
  previewEl.className = 'preview';
  previewEl.innerHTML = `
    <div class="pv-head">
      <div class="plate">${t.icon}</div>
      <h2>${esc(t.name)}</h2>
    </div>
    <p class="pv-desc">${esc(t.description)}</p>
    <dl>
      <dt>category</dt><dd>${esc(t.category)}</dd>
      <dt>opens</dt><dd>${esc(host(t.url))}</dd>
    </dl>
    <a class="open" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">Open tool ↵</a>`;
}

function applySelection(scroll){
  listEl.querySelectorAll('.row').forEach((r, i) => {
    r.classList.toggle('sel', i === sel);
  });
  if(scroll){
    const row = listEl.querySelector('.row.sel');
    if(row) row.scrollIntoView({block:'nearest'});
  }
  renderPreview();
}

function render(){
  const raw = searchInput.value.trim();
  const term = raw.toLowerCase();
  queryBox.classList.toggle('has-text', raw.length > 0);

  /* Array.sort is stable, so non-featured tools keep their load order */
  results = tools
    .filter(t => (activeCategory === "All" || t.category === activeCategory) && matchesSearch(t, term))
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  sel = 0;
  moved = false;
  countEl.textContent = `${results.length}/${tools.length}`;

  if(results.length === 0){
    listEl.innerHTML = `
      <div class="empty">
        <p>No tools found${raw ? ` for “${esc(raw)}”` : ''}. Try another keyword.</p>
        <button type="button" id="resetBtn">Clear search</button>
      </div>`;
    document.getElementById('resetBtn').addEventListener('click', resetAll);
    live.textContent = 'No tools found.';
  } else {
    listEl.innerHTML = results.map(rowHTML).join('');
    live.textContent = `${results.length} ${results.length === 1 ? 'tool' : 'tools'} found.`;
  }
  applySelection(false);
}

function resetAll(){
  searchInput.value = '';
  activeCategory = "All";
  chipsEl.querySelectorAll('.flag').forEach(c => c.setAttribute('aria-pressed', c.dataset.category === "All"));
  render();
  searchInput.focus();
}

/* ===== EVENTS ===== */
chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.flag');
  if(!btn) return;
  activeCategory = btn.dataset.category;
  chipsEl.querySelectorAll('.flag').forEach(c => c.setAttribute('aria-pressed', c === btn));
  render();
});

searchInput.addEventListener('input', render);
searchClear.addEventListener('click', () => { searchInput.value = ''; render(); searchInput.focus(); });

/* Hovering or focusing a row selects it, so the preview follows */
function selectFromEvent(e){
  const row = e.target.closest('.row');
  if(!row) return;
  const i = Number(row.dataset.i);
  if(i !== sel){ sel = i; applySelection(false); }
}
listEl.addEventListener('mouseover', selectFromEvent);
listEl.addEventListener('focusin', selectFromEvent);

searchInput.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
    if(!results.length) return;
    e.preventDefault();
    sel = e.key === 'ArrowDown' ? Math.min(sel + 1, results.length - 1) : Math.max(sel - 1, 0);
    moved = true;
    applySelection(true);
  } else if(e.key === 'Enter'){
    /* Enter opens the selected tool, but not on a bare, untouched page */
    if(results[sel] && (searchInput.value.trim() || moved)){
      e.preventDefault();
      window.open(results[sel].url, '_blank', 'noopener,noreferrer');
    }
  } else if(e.key === 'Escape'){
    searchInput.value = '';
    render();
  }
});

/* "/" focuses search from anywhere, unless already typing in a field */
document.addEventListener('keydown', (e) => {
  if(e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = document.activeElement.tagName;
  if(tag === 'INPUT' || tag === 'TEXTAREA') return;
  e.preventDefault();
  searchInput.focus();
});

render();

/* ===== TYPED PLACEHOLDER (cycles example queries) ===== */
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
  setTimeout(cyclePlaceholder, 1600);
}

/* ===== THEME TOGGLE ===== */
document.getElementById('themeToggle').addEventListener('click', () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try{ localStorage.setItem('tbj-theme', next); }catch(e){}
});

/* Entrance animation runs once, then gets out of the way */
setTimeout(() => document.body.classList.remove('intro'), 2200);

})();
