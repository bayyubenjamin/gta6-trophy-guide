// Boot + wiring for the Leonida Trophy Guide.
// Deep links for screenshots and sharing: ?view=checklist|roadmap|progress,
// ?trophy=<id> opens a trophy's detail, ?spoiler=on, ?kind=story|missable|
// collectibles|activities|online, ?grade=gold|silver|bronze|platinum,
// ?demo=1 pre-ticks a fixed set of trophies in memory (no localStorage write).

import { loadEarned, saveEarned, toggleEarned, exportEarned, importEarned } from './tracker.js';
import { filterTrophies, displayName, trophyIsHiddenBySpoiler } from './filters.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderProgress } from './progress.js';

const params = new URLSearchParams(window.location.search);

const state = {
  data: null,
  earned: new Set(),
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  query: '',
  spoiler: false,
  selectedId: null,
};

const els = {
  earnedCount: document.getElementById('earnedCount'),
  platinumBar: document.getElementById('platinumBar'),
  platinumNote: document.getElementById('platinumNote'),
  search: document.getElementById('search'),
  kindFilters: document.getElementById('kindFilters'),
  gradeSelect: document.getElementById('grade'),
  spoiler: document.getElementById('spoiler'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  importStatus: document.getElementById('importStatus'),
  shownCount: document.getElementById('shownCount'),
  trophyList: document.getElementById('trophyList'),
  emptyState: document.getElementById('emptyState'),
  detail: document.getElementById('detail'),
  views: {
    checklist: document.getElementById('view-checklist'),
    roadmap: document.getElementById('view-roadmap'),
    progress: document.getElementById('view-progress'),
  },
};

function updateHeader() {
  const total = state.data.trophies.length;
  const earned = state.earned.size;
  els.earnedCount.textContent = String(earned);
  els.platinumBar.style.width = `${Math.round((earned / total) * 100)}%`;
  const platinum = state.data.trophies.find((t) => t.grade === 'platinum');
  els.platinumNote.textContent =
    platinum && state.earned.has(platinum.id)
      ? 'Platinum earned — Vice Got a Price!'
      : `Platinum: Vice Got a Price! — earn the other ${total - 1}`;
}

function renderChecklist() {
  const shown = filterTrophies(state.data.trophies, state.earned, state);
  els.shownCount.textContent = `Showing ${shown.length} of ${state.data.trophies.length} trophies`;
  els.emptyState.hidden = shown.length !== 0;
  els.trophyList.replaceChildren();

  for (const trophy of shown) {
    const hidden = trophyIsHiddenBySpoiler(trophy, state.earned, state.spoiler);
    const item = document.createElement('li');
    item.className = 'trophy';
    if (state.earned.has(trophy.id)) item.classList.add('earned');
    if (state.selectedId === trophy.id) item.classList.add('selected');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = state.earned.has(trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('click', (event) => {
      event.stopPropagation();
      state.earned = toggleEarned(state.earned, trophy.id);
      refresh();
    });
    item.appendChild(checkbox);

    const body = document.createElement('div');

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy, state.earned, state.spoiler);
    head.appendChild(name);
    const grade = document.createElement('span');
    grade.className = `grade ${trophy.grade}`;
    grade.textContent = trophy.grade;
    head.appendChild(grade);
    for (const kind of trophy.kinds) {
      const pill = document.createElement('span');
      pill.className = kind === 'missable' ? 'pill missable' : 'pill';
      pill.textContent = kind;
      head.appendChild(pill);
    }
    if (trophy.hidden) {
      const pill = document.createElement('span');
      pill.className = 'pill hidden-tag';
      pill.textContent = 'hidden on PlayStation';
      head.appendChild(pill);
    }
    body.appendChild(head);

    if (hidden) {
      const note = document.createElement('p');
      note.className = 'trophy-meta';
      const span = document.createElement('span');
      span.className = 'spoiler-note';
      span.textContent = 'Story trophy — name and guide hidden until earned (spoiler mode).';
      note.appendChild(span);
      body.appendChild(note);
    } else {
      const desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = trophy.description;
      body.appendChild(desc);
      const preview = document.createElement('p');
      preview.className = 'trophy-guide-preview';
      preview.textContent = trophy.guide;
      body.appendChild(preview);
      const meta = document.createElement('p');
      meta.className = 'trophy-meta';
      meta.textContent = `Sources: ${trophy.sources.map((s) => s.name).join(', ')}${trophy.unconfirmed ? ' · Not fully confirmed' : ''}`;
      body.appendChild(meta);
    }

    item.appendChild(body);
    item.addEventListener('click', () => {
      state.selectedId = trophy.id;
      refresh();
    });
    els.trophyList.appendChild(item);
  }
}

function renderCurrentView() {
  for (const [name, section] of Object.entries(els.views)) {
    section.hidden = name !== state.view;
  }
  document.querySelectorAll('.tabs button').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.view);
  });
  if (state.view === 'roadmap') renderRoadmap(els.views.roadmap, state.data, state.earned);
  if (state.view === 'progress') renderProgress(els.views.progress, state.data.trophies, state.earned);
}

function refresh() {
  updateHeader();
  renderChecklist();
  const selected = state.data.trophies.find((t) => t.id === state.selectedId) || null;
  renderDetail(els.detail, selected, state.earned, state.spoiler, (id) => {
    state.earned = toggleEarned(state.earned, id);
    refresh();
  });
  renderCurrentView();
}

async function boot() {
  let data;
  try {
    const response = await fetch('data/trophies.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (err) {
    els.trophyList.replaceChildren();
    const note = document.createElement('p');
    note.className = 'empty';
    note.textContent = 'Could not load the trophy data (data/trophies.json). The app works offline, but it needs its own data file — check that data/trophies.json sits next to index.html.';
    els.trophyList.appendChild(note);
    return;
  }
  state.data = data;

  state.earned = loadEarned(data.trophies, params);
  if (params.get('demo') !== '1') saveEarned(state.earned);

  const view = params.get('view');
  if (view === 'roadmap' || view === 'progress' || view === 'checklist') state.view = view;
  const kind = params.get('kind');
  if (['story', 'missable', 'collectibles', 'activities', 'online'].includes(kind)) state.kind = kind;
  const grade = params.get('grade');
  if (['platinum', 'gold', 'silver', 'bronze'].includes(grade)) state.grade = grade;
  state.spoiler = params.get('spoiler') === 'on';
  const trophyParam = Number.parseInt(params.get('trophy') || '', 10);
  if (Number.isInteger(trophyParam) && data.trophies.some((t) => t.id === trophyParam)) {
    state.selectedId = trophyParam;
  }

  els.search.addEventListener('input', () => {
    state.query = els.search.value;
    renderChecklist();
  });
  els.kindFilters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    els.kindFilters.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === button));
    renderChecklist();
  });
  els.gradeSelect.addEventListener('change', () => {
    state.grade = els.gradeSelect.value;
    renderChecklist();
  });
  els.spoiler.addEventListener('change', () => {
    state.spoiler = els.spoiler.checked;
    refresh();
  });
  document.querySelectorAll('.tabs button').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      renderCurrentView();
    });
  });
  els.exportBtn.addEventListener('click', () => {
    exportEarned(state.earned, data.trophies);
    els.importStatus.textContent = `Exported ${state.earned.size} earned trophies.`;
    els.importStatus.classList.remove('error');
  });
  els.importFile.addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const { imported, unknown } = await importEarned(file, data.trophies);
      state.earned = imported;
      els.importStatus.textContent = `Imported ${imported.size} trophies${unknown.length ? ` (${unknown.length} unknown names skipped)` : ''}.`;
      els.importStatus.classList.remove('error');
      refresh();
    } catch (err) {
      els.importStatus.textContent = err.message;
      els.importStatus.classList.add('error');
    }
    event.target.value = '';
  });

  els.kindFilters.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.kind === state.kind));
  els.gradeSelect.value = state.grade;
  els.spoiler.checked = state.spoiler;

  refresh();
}

boot();
