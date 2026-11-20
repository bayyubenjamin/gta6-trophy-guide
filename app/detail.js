// detail.js — renders the trophy detail panel.
// The panel shows the official name, description and grade, the missable
// warning, the unconfirmed notice, the guide steps, and the cited sources.
// Guide text is split into steps on sentence boundaries so it reads as a
// checklist rather than a wall of prose.

import { escapeHtml } from "./html.js";

export function splitSteps(guideText) {
  const parts = [];
  let current = "";
  for (const ch of guideText) {
    current += ch;
    if (ch === "." || ch === "!" || ch === "?") {
      const trimmed = current.trim();
      if (trimmed.length > 0) parts.push(trimmed);
      current = "";
    }
  }
  const tail = current.trim();
  if (tail.length > 0) parts.push(tail);
  return parts;
}

export function renderDetail(trophy, isEarned) {
  if (!trophy) {
    return '<p class="detail-empty">Select a trophy to read its guide, sources, and warnings.</p>';
  }
  const steps = splitSteps(trophy.guide);
  const gradeLabel = trophy.grade.charAt(0).toUpperCase() + trophy.grade.slice(1);
  let html = "";
  html += "<h2>" + escapeHtml(trophy.name) + "</h2>";
  html += '<p><span class="grade ' + escapeHtml(trophy.grade) + '">' + escapeHtml(gradeLabel) + '</span> ';
  html += '<span class="tag">' + escapeHtml(trophy.kind) + "</span>";
  if (trophy.missable) html += ' <span class="tag missable">Missable</span>';
  if (trophy.unconfirmed) html += ' <span class="tag unconfirmed">Unconfirmed</span>';
  html += "</p>";
  html += '<p class="t-desc">' + escapeHtml(trophy.description) + "</p>";
  html += "<p><strong>Status:</strong> " + (isEarned ? "Earned" : "Not earned yet") + "</p>";
  const stageNames = { 1: "Stage 1 — Story", 2: "Stage 2 — 100% cleanup", 3: "Stage 3 — Strangers & Freaks" };
  const stageName = stageNames[trophy.stage] || "Roadmap";
  html += "<p><strong>Roadmap:</strong> " + escapeHtml(stageName) + "</p>";
  if (trophy.missable) {
    html += '<div class="warn-box"><strong>Missable — do not miss this.</strong> ';
    html += "This is the game&rsquo;s only missable trophy. The first meditation spot is Lucia&rsquo;s balcony in Chapter 1, and it cannot be revisited once the chapter ends. Do it before Chapter 1 ends.</div>";
  }
  if (trophy.unconfirmed) {
    html += '<div class="unconfirmed-box"><strong>Not yet confirmed.</strong> ';
    html += "No published guide has verified how this trophy unlocks. The steps below are honest about that — they do not invent a method. Check the cited guides for an update before you attempt it.</div>";
  }
  html += "<h3>Guide</h3>";
  html += "<ol>";
  for (const step of steps) {
    html += "<li>" + escapeHtml(step) + "</li>";
  }
  html += "</ol>";
  html += "<h3>Sources</h3>";
  html += '<ul class="sources">';
  for (const source of trophy.sources || []) {
    html += '<li><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.name) + "</a></li>";
  }
  html += "</ul>";
  return html;
}
