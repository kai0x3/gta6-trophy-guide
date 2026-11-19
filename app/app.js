// Leonida Legend — GTA VI trophy guide and tracker.
// Loads the trophy data, renders the checklist with a guide detail pane,
// saves ticks in localStorage, and offers export / import of progress.
// Views: guide (checklist + detail), roadmap, missables. A ?demo=1 query
// seeds 13 earned trophies for screenshots only; real users start at 0.

const STORE_KEY = 'leonida-legend-v1';
const DEMO_EARNED = [2, 3, 8, 15, 16, 20, 21, 28, 30, 35, 42, 52, 53];

const params = new URLSearchParams(location.search);
const demoMode = params.get('demo') === '1';

const els = {
  cards: document.getElementById('cards'),
  detail: document.getElementById('detailCol'),
  listMeta: document.getElementById('listMeta'),
  progressCount: document.getElementById('progressCount'),
  progressPct: document.getElementById('progressPct'),
  gradeCounts: document.getElementById('gradeCounts'),
  ringFill: document.getElementById('ringFill'),
  search: document.getElementById('search'),
  kind: document.getElementById('kind'),
  grade: document.getElementById('grade'),
  earnedOnly: document.getElementById('earnedOnly'),
  spoiler: document.getElementById('spoiler'),
  viewNote: document.getElementById('viewNote'),
  guideView: document.getElementById('guideView'),
  roadmapView: document.getElementById('roadmapView'),
  missablesView: document.getElementById('missablesView'),
  missableCards: document.getElementById('missableCards'),
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(loadStoredEarned());
let selectedId = Number(params.get('trophy')) || null;
let view = params.get('view') || 'guide';
if (!['guide', 'roadmap', 'missables'].includes(view)) view = 'guide';

function loadStoredEarned() {
  if (demoMode) return DEMO_EARNED;
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{"earned":[]}');
    return Array.isArray(raw.earned) ? raw.earned : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  if (demoMode) return;
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], savedAt: new Date().toISOString() }));
}

function spoilerOn() {
  return els.spoiler.checked;
}

function displayName(t) {
  if (spoilerOn() && t.story && !earned.has(t.id)) return 'Hidden story trophy';
  return t.name;
}

function displayDesc(t) {
  if (spoilerOn() && t.story && !earned.has(t.id)) return 'Hidden until earned — turn off “Hide story spoilers” to reveal it.';
  return t.description;
}

function kindLabel(t) {
  if (t.kind === 'story') return 'Story';
  if (t.kind === 'character') return 'Character quest';
  if (t.kind === 'collectibles') return 'Collectibles';
  if (t.kind === 'activities') return 'Activities';
  if (t.kind === 'robberies') return 'Robberies';
  if (t.kind === 'exploration') return 'Exploration';
  if (t.kind === 'money') return 'Money';
  if (t.kind === 'secrets') return 'Secrets';
  if (t.kind === 'completion') return '100% completion';
  return 'Platinum';
}

function visibleTrophies() {
  const q = els.search.value.trim().toLowerCase();
  const kind = els.kind.value;
  const grade = els.grade.value;
  return trophies.filter((t) => {
    if (q && !t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && kind !== 'online' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (els.earnedOnly.checked && !earned.has(t.id)) return false;
    return true;
  });
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = 'badge ' + cls;
  s.textContent = text;
  return s;
}

function buildCard(t) {
  const li = document.createElement('li');
  li.className = 'card' + (earned.has(t.id) ? ' is-earned' : '') + (selectedId === t.id ? ' is-selected' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('click', (ev) => ev.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderAll();
  });
  const body = document.createElement('div');
  const h = document.createElement('h3');
  h.textContent = displayName(t);
  if (spoilerOn() && t.story && !earned.has(t.id)) h.classList.add('spoiled');
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDesc(t);
  body.append(h, desc);
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(badge(t.grade, t.grade));
  meta.append(badge(kindLabel(t), 'plain'));
  if (t.count != null) meta.append(badge('Target: ' + t.count, 'plain'));
  if (t.hidden) meta.append(badge('Hidden', 'hidden'));
  if (t.missable) meta.append(badge('Missable', 'missable'));
  body.append(meta);
  const open = document.createElement('span');
  open.className = 'open';
  open.textContent = earned.has(t.id) ? 'Earned' : 'Guide';
  li.append(box, body, open);
  li.addEventListener('click', () => {
    selectedId = t.id;
    renderAll();
  });
  return li;
}

function renderList() {
  const list = visibleTrophies();
  els.cards.replaceChildren(...list.map(buildCard));
  const earnedCount = list.filter((t) => earned.has(t.id)).length;
  els.listMeta.textContent = list.length === trophies.length
    ? 'Showing all 55 trophies — click a card to read its guide. ' + earned.size + ' earned so far.'
    : 'Showing ' + list.length + ' of 55 trophies (' + earnedCount + ' of them earned).';
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  els.progressCount.textContent = n + ' / ' + total;
  els.progressPct.textContent = pct + '% to platinum';
  const counts = {};
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] = (counts[t.grade] || 0) + 1;
  els.gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => (counts[g] || 0) + ' ' + g).join(' · ');
  const circ = 2 * Math.PI * 52;
  els.ringFill.style.strokeDashoffset = String(circ * (1 - n / total));
}

function renderDetail() {
  const t = selectedId != null ? byId.get(selectedId) : null;
  els.detail.replaceChildren();
  if (!t) {
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    empty.textContent = 'Pick a trophy on the left to read its full guide: what to do, where and how, whether it can be missed, and the sources behind each fact.';
    els.detail.append(empty);
    return;
  }
  const box = document.createElement('article');
  box.className = 'detail';
  const hiddenTag = t.hidden ? ' · Hidden on PSN' : '';
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = displayDesc(t);
  const facts = document.createElement('div');
  facts.className = 'facts';
  facts.append(badge(t.grade, t.grade));
  facts.append(badge(kindLabel(t), 'plain'));
  if (t.count != null) facts.append(badge('Target: ' + t.count, 'plain'));
  if (t.hidden) facts.append(badge('Hidden', 'hidden'));
  if (t.missable) facts.append(badge('Missable — read first', 'missable'));
  facts.append(badge('Roadmap stage ' + t.stage, 'plain'));
  box.append(h, official, facts);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.innerHTML = '<strong>Possibly missable.</strong> Do the Chapter 1 balcony meditation (see the guide below) before Chapter 1 ends — it is the only step in the game that can disappear. Keep a Chapter 1 manual save until this trophy pops.';
    box.append(warn);
  }
  if (spoilerOn() && t.story && !earned.has(t.id)) {
    const p = document.createElement('p');
    p.className = 'guide-text spoiled';
    p.textContent = 'Guide hidden with the spoiler setting — earn this trophy, or turn the setting off, to read it.';
    box.append(p);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = t.guide;
    box.append(guide);
    if (Array.isArray(t.steps) && t.steps.length) {
      const ol = document.createElement('ol');
      ol.className = 'steps';
      for (const step of t.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        ol.append(li);
      }
      box.append(ol);
    }
  }
  const src = document.createElement('div');
  src.className = 'sources';
  const sh = document.createElement('h4');
  sh.textContent = 'Sources';
  src.append(sh);
  const ul = document.createElement('ul');
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  src.append(ul);
  const note = document.createElement('p');
  note.className = 'source-note';
  note.textContent = 'Guide text is written in our own words for this entry; the sources above are where each fact comes from. Names and descriptions are PlayStation’s official list.' + hiddenTag;
  src.append(note);
  box.append(src);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    saveProgress();
    renderAll();
  });
  box.append(toggle);
  els.detail.append(box);
}

function renderRoadmap() {
  els.roadmapView.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = 'Roadmap to the platinum';
  const lede = document.createElement('p');
  lede.className = 'lede';
  lede.textContent = 'Five stages, in earning order, built from the official trophy descriptions. PowerPyx rates the whole set 4/10 and about 200 hours, with one playthrough and no online trophies. Click any trophy chip to open its guide.';
  els.roadmapView.append(h, lede);
  for (const stage of doc.roadmap || []) {
    const sec = document.createElement('section');
    sec.className = 'stage';
    const title = document.createElement('h3');
    title.textContent = 'Stage ' + stage.stage + ' — ' + stage.title;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = stage.time;
    const sum = document.createElement('p');
    sum.textContent = stage.summary;
    const watch = document.createElement('p');
    watch.className = 'watch';
    watch.textContent = 'Watch out: ' + stage.watch;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const c = document.createElement('button');
      c.type = 'button';
      c.className = 'chip' + (earned.has(id) ? ' is-earned' : '');
      c.textContent = (earned.has(id) ? '✓ ' : '') + t.name + ' · ' + t.grade;
      c.addEventListener('click', () => {
        selectedId = id;
        setView('guide');
      });
      chips.append(c);
    }
    sec.append(title, time, sum, watch, chips);
    els.roadmapView.append(sec);
  }
}

function renderMissables() {
  const missable = trophies.filter((t) => t.missable);
  els.missableCards.replaceChildren(...missable.map(buildCard));
}

function setView(next) {
  view = next;
  for (const tab of document.querySelectorAll('.view-tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === view);
  }
  els.guideView.hidden = view !== 'guide';
  els.roadmapView.hidden = view !== 'roadmap';
  els.missablesView.hidden = view !== 'missables';
  document.querySelector('.toolbar').style.display = view === 'guide' ? '' : 'none';
  els.viewNote.textContent = view === 'roadmap'
    ? 'Five stages, in earning order.'
    : view === 'missables'
      ? 'One possibly missable trophy — plus the save habits that protect the rest.'
      : 'Click a card to read its guide. Ticks save automatically.';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

for (const tab of document.querySelectorAll('.view-tab')) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
}
for (const input of [els.search, els.kind, els.grade, els.earnedOnly, els.spoiler]) {
  input.addEventListener('input', renderAll);
  input.addEventListener('change', renderAll);
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    const names = Array.isArray(raw) ? raw : raw.earned;
    const next = new Set();
    for (const item of names || []) {
      const t = trophies.find((x) => x.name === item || x.id === item);
      if (t) next.add(t.id);
    }
    earned = next;
    saveProgress();
    renderAll();
  } catch {
    alert('That file could not be read as trophy progress.');
  }
  ev.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks?')) return;
  earned = new Set();
  saveProgress();
  renderAll();
});

if (params.get('kind')) els.kind.value = params.get('kind');
if (params.get('grade')) els.grade.value = params.get('grade');
if (params.get('q')) els.search.value = params.get('q');
if (params.get('spoiler') === '1') els.spoiler.checked = true;
if (params.get('earned') === '1') els.earnedOnly.checked = true;

setView(view);
renderAll();
