/* ==========================================================================
   Tools By JRN — app logic
   Reads window.TOOLS (populated by js/tools/*.js, which load before this
   file) and drives the hero search, category chips, tools grid, theme
   toggle, and mobile menu. No tool-specific data belongs in this file —
   add new tools in js/tools/ instead.
   ========================================================================== */
(function(){
"use strict";

const tools = window.TOOLS || [];

/* ===== RENDER HELPERS ===== */
function cardHTML(tool){
  return `
  <article class="card">
    ${tool.featured ? '<span class="featured-tag">Featured</span>' : ''}
    <div class="card-thumb">${tool.icon}</div>
    <div class="card-category">${tool.category}</div>
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <a class="card-link" href="${tool.url}" target="_blank" rel="noopener noreferrer">
      <span>Open Tool</span>
      <span class="arrow-chip" aria-hidden="true">→</span>
    </a>
  </article>`;
}

function revealOnScroll(container){
  const cards = container.querySelectorAll('.card');
  requestAnimationFrame(()=>{
    cards.forEach((c, i)=>{
      setTimeout(()=>c.classList.add('visible'), i * 70);
    });
  });
}

document.getElementById('trustLine').textContent =
  `${tools.length} tool${tools.length === 1 ? '' : 's'} and counting · free · no ads`;

/* ===== CATEGORY CHIPS (drive the hero search + tools grid together) ===== */
const categories = ["All", ...new Set(tools.map(t=>t.category))];
const chipsEl = document.getElementById('chips');
chipsEl.innerHTML = categories.map((cat,i)=>
  `<button class="chip${i===0?' active':''}" data-category="${cat}" aria-pressed="${i===0}">${cat}</button>`
).join('');
let activeCategory = "All";

/* ===== SEARCH + FILTER LOGIC ===== */
const toolsGrid = document.getElementById('toolsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');

function matchesSearch(tool, term){
  if(!term) return true;
  const haystack = [tool.name, tool.description, tool.category, ...tool.keywords].join(' ').toLowerCase();
  return haystack.includes(term);
}

function renderTools(){
  const term = searchInput.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', term.length > 0);
  const results = tools.filter(t=>
    (activeCategory === "All" || t.category === activeCategory) && matchesSearch(t, term)
  );
  if(results.length === 0){
    toolsGrid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    toolsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    toolsGrid.innerHTML = results.map(cardHTML).join('');
    revealOnScroll(toolsGrid);
  }
}

chipsEl.addEventListener('click', (e)=>{
  const btn = e.target.closest('.chip');
  if(!btn) return;
  activeCategory = btn.dataset.category;
  chipsEl.querySelectorAll('.chip').forEach(p=>{
    p.classList.toggle('active', p === btn);
    p.setAttribute('aria-pressed', p === btn);
  });
  renderTools();
});
searchInput.addEventListener('input', renderTools);
searchClear.addEventListener('click', ()=>{
  searchInput.value = '';
  searchInput.focus();
  renderTools();
});
document.getElementById('launchBtn').addEventListener('click', ()=>{
  document.getElementById('tools').scrollIntoView({behavior:'smooth'});
});
searchInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    document.getElementById('tools').scrollIntoView({behavior:'smooth'});
  }
});
renderTools();

/* "/" focuses search from anywhere, unless already typing in a field */
document.addEventListener('keydown', (e)=>{
  if(e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){
    e.preventDefault();
    searchInput.focus();
  }
});

/* ===== TYPED PLACEHOLDER (hero search, cycles example queries) ===== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const examples = ["Search tools…", "Try \u2018merge pdf\u2019", "Try \u2018cover page\u2019"];
if(!reduceMotion){
  let exIndex = 0, charIndex = 0, deleting = false;
  function cyclePlaceholder(){
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
  }
  cyclePlaceholder();
} else {
  searchInput.placeholder = "Search tools…";
}

/* ===== THEME TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', ()=>{
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try{ localStorage.setItem('tbj-theme', next); }catch(e){}
});

/* ===== MOBILE MENU ===== */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobilePanel = document.getElementById('mobilePanel');
hamburgerBtn.addEventListener('click', ()=>{
  const open = mobilePanel.classList.toggle('open');
  hamburgerBtn.classList.toggle('active', open);
  hamburgerBtn.setAttribute('aria-expanded', open);
});
mobilePanel.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=>{
    mobilePanel.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', false);
  });
});

})();
