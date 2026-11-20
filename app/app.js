// app.js — main module for the Leonida Trophy Guide.
// Loads the trophy data, owns the page state, renders the list, and wires
// every control: search, kind and grade filters, spoiler mode, view tabs,
// the detail panel, and export/import. Deep links are read from the URL.

import { createTracker } from "./tracker.js";
import { filterTrophies, isSpoilerHidden, spoilerLabel } from "./filters.js";
import { renderDetail } from "./detail.js";
import { renderRoadmap } from "./roadmap.js";
import { renderProgress } from "./progress.js";
import { escapeHtml } from "./html.js";

const DATA_URL = "./data/trophies.json";

const state = {
  trophies: [],
  kind: "all",
  grade: "all",
  query: "",
  spoiler: false,
  view: "guide",
  selectedId: null,
  tracker: null,
  demoMode: false
};

function readDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "roadmap" || view === "progress" || view === "guide") state.view = view;
  if (params.get("spoiler") === "on") state.spoiler = true;
  const kind = params.get("kind");
  if (kind && ["story", "missable", "collectibles", "activities", "online"].includes(kind)) state.kind = kind;
  const trophy = params.get("trophy");
  if (trophy && Number.isInteger(Number(trophy))) state.selectedId = Number(trophy);
  state.demoMode = params.get("demo") === "1";
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function renderOverall() {
  const earned = state.tracker.earnedCount();
  const total = state.trophies.length;
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
  document.getElementById("earnedCount").textContent = String(earned);
  document.getElementById("overallFill").style.width = pct + "%";
  document.getElementById("overallPct").textContent = pct + "% to platinum";
}

function renderList() {
  const list = document.getElementById("trophyList");
  const meta = document.getElementById("listMeta");
  const shown = filterTrophies(state.trophies, {
    kind: state.kind,
    grade: state.grade,
    query: state.query
  });
  const earnedShown = shown.filter((t) => state.tracker.isEarned(t.id)).length;
  meta.textContent = "Showing " + shown.length + " of " + state.trophies.length + " trophies (" + earnedShown + " earned in this view).";
  let html = "";
  for (const trophy of shown) {
    const earned = state.tracker.isEarned(trophy.id);
    const hidden = isSpoilerHidden(trophy, state.spoiler, earned);
    const selected = state.selectedId === trophy.id ? " selected" : "";
    const earnedCls = earned ? " earned" : "";
    const displayName = hidden ? "Hidden story trophy" : trophy.name;
    const displayDesc = hidden ? spoilerLabel() : trophy.description;
    html += '<li class="trophy-card' + selected + earnedCls + '" data-id="' + trophy.id + '">';
    html += '<input type="checkbox" data-check="' + trophy.id + '"' + (earned ? " checked" : "") + ' aria-label="Mark ' + escapeHtml(displayName) + ' as earned">';
    html += '<div><div class="t-name">' + escapeHtml(displayName) + "</div>";
    html += '<div class="t-desc">' + escapeHtml(displayDesc) + "</div>";
    html += '<div class="t-tags"><span class="tag">' + escapeHtml(trophy.kind) + "</span>";
    if (trophy.missable) html += '<span class="tag missable">Missable</span>';
    if (trophy.unconfirmed) html += '<span class="tag unconfirmed">Unconfirmed</span>';
    html += "</div></div>";
    html += '<span class="grade ' + escapeHtml(trophy.grade) + '">' + escapeHtml(gradeLabel(trophy.grade)) + "</span>";
    html += "</li>";
  }
  if (shown.length === 0) {
    html = '<li class="trophy-card"><div>No trophies match these filters. Try a different kind, grade or search.</div></li>';
  }
  list.innerHTML = html;
}

function renderDetailPanel() {
  const panel = document.getElementById("detailPanel");
  const trophy = state.trophies.find((t) => t.id === state.selectedId) || null;
  if (trophy && isSpoilerHidden(trophy, state.spoiler, state.tracker.isEarned(trophy.id))) {
    panel.innerHTML = '<p class="detail-empty">This story trophy is hidden by spoiler mode. Earn it to reveal its guide, or turn spoiler mode off.</p>';
    return;
  }
  panel.innerHTML = renderDetail(trophy, trophy ? state.tracker.isEarned(trophy.id) : false);
}

function renderViews() {
  const views = { guide: "view-guide", roadmap: "view-roadmap", progress: "view-progress" };
  for (const [name, id] of Object.entries(views)) {
    document.getElementById(id).classList.toggle("active", state.view === name);
  }
  for (const btn of document.querySelectorAll(".view-tabs button")) {
    btn.classList.toggle("active", btn.dataset.view === state.view);
  }
  if (state.view === "roadmap") {
    document.getElementById("roadmapRoot").innerHTML = renderRoadmap(state.trophies, (id) => state.tracker.isEarned(id));
  }
  if (state.view === "progress") {
    document.getElementById("progressRoot").innerHTML = renderProgress(state.trophies, (id) => state.tracker.isEarned(id));
  }
}

function renderAll() {
  renderOverall();
  renderList();
  renderDetailPanel();
  renderViews();
}

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireControls() {
  const search = document.getElementById("search");
  search.addEventListener("input", () => {
    state.query = search.value;
    renderList();
  });

  document.getElementById("kindFilters").addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-kind]");
    if (!btn) return;
    state.kind = btn.dataset.kind;
    for (const b of document.querySelectorAll("#kindFilters button")) {
      b.classList.toggle("active", b === btn);
    }
    renderList();
  });

  document.getElementById("gradeFilter").addEventListener("change", (event) => {
    state.grade = event.target.value;
    renderList();
  });

  const spoiler = document.getElementById("spoilerToggle");
  spoiler.checked = state.spoiler;
  spoiler.addEventListener("change", () => {
    state.spoiler = spoiler.checked;
    renderList();
    renderDetailPanel();
  });

  document.querySelector(".view-tabs").addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-view]");
    if (!btn) return;
    state.view = btn.dataset.view;
    renderViews();
  });

  document.getElementById("trophyList").addEventListener("click", (event) => {
    const check = event.target.closest("input[data-check]");
    if (check) {
      event.stopPropagation();
      const id = Number(check.dataset.check);
      state.tracker.toggle(id);
      renderOverall();
      renderList();
      renderDetailPanel();
      if (state.view === "roadmap" || state.view === "progress") renderViews();
      return;
    }
    const card = event.target.closest(".trophy-card[data-id]");
    if (card) {
      state.selectedId = Number(card.dataset.id);
      renderList();
      renderDetailPanel();
    }
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    download("leonida-trophy-progress.json", state.tracker.exportState());
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!window.confirm("Clear all earned trophies? This cannot be undone.")) return;
    state.tracker.clearAll();
    renderAll();
  });

  const importFile = document.getElementById("importFile");
  document.getElementById("importBtn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state.tracker.importState(String(reader.result));
        renderAll();
      } catch (err) {
        window.alert("That file is not a Leonida Trophy Guide export.");
      }
      importFile.value = "";
    };
    reader.readAsText(file);
  });

  // Sync the kind filter buttons with any ?kind= deep link.
  for (const b of document.querySelectorAll("#kindFilters button")) {
    b.classList.toggle("active", b.dataset.kind === state.kind);
  }
}

async function init() {
  readDeepLinks();
  state.tracker = createTracker(state.demoMode);
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error("Could not load " + DATA_URL);
  const data = await response.json();
  state.trophies = data.trophies || [];
  state.trophies.sort((a, b) => a.id - b.id);
  wireControls();
  renderAll();
  window.__shotReady = true;
}

init().catch((err) => {
  const list = document.getElementById("trophyList");
  if (list) list.innerHTML = "<li class=\"trophy-card\"><div>Could not load the trophy data. " + escapeHtml(err.message) + "</div></li>";
});
