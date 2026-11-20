// progress.js — renders the Progress view.
// Shows the overall completion, the per-kind and per-grade breakdown, and the
// full list of trophies whose unlock is still unconfirmed, in one place.

import { escapeHtml } from "./html.js";
import { countByKind, countByGrade } from "./filters.js";

export function renderProgress(trophies, isEarned) {
  const total = trophies.length;
  const earned = trophies.filter((t) => isEarned(t.id)).length;
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
  const kinds = countByKind(trophies, isEarned);
  const grades = countByGrade(trophies, isEarned);
  const unconfirmed = trophies.filter((t) => t.unconfirmed);

  let html = '<div class="progress-grid">';
  html += '<div class="progress-card"><h2>Overall</h2>';
  html += '<div class="big-number">' + earned + " / " + total + "</div>";
  html += "<p>" + pct + "% of the way to the platinum. The platinum, Vice Got a Price!, unlocks when every other trophy is earned.</p>";
  html += '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
  const remainingHours = Math.round((1 - earned / Math.max(total, 1)) * 190);
  html += "<p>Estimated time left at the roadmap pace (story 60–80 h, cleanup ~100 h, Strangers &amp; Freaks 10–20 h): about " + remainingHours + " hours.</p>";
  html += "</div>";

  html += '<div class="progress-card"><h2>By kind</h2><ul>';
  const kindOrder = ["story", "missable", "collectibles", "activities", "online"];
  for (const kind of kindOrder) {
    const c = kinds[kind];
    if (!c) continue;
    html += "<li>" + escapeHtml(kind) + ": " + c.earned + " / " + c.total + "</li>";
  }
  html += "</ul><h2>By grade</h2><ul>";
  const gradeOrder = ["platinum", "gold", "silver", "bronze"];
  for (const grade of gradeOrder) {
    const c = grades[grade];
    if (!c) continue;
    html += "<li>" + escapeHtml(grade) + ": " + c.earned + " / " + c.total + "</li>";
  }
  html += "</ul></div>";

  html += '<div class="progress-card"><h2>Not yet confirmed (' + unconfirmed.length + ")</h2>";
  html += "<p>These trophies have no verified unlock method in any published guide yet. Their guides say so honestly instead of inventing steps. Check the cited guides for updates before you attempt them.</p><ul>";
  for (const trophy of unconfirmed) {
    const mark = isEarned(trophy.id) ? " — earned" : "";
    html += "<li>" + escapeHtml(trophy.name) + escapeHtml(mark) + "</li>";
  }
  html += "</ul></div>";

  const nextUp = trophies.filter((t) => !isEarned(t.id) && !t.unconfirmed).slice(0, 8);
  html += '<div class="progress-card"><h2>Up next</h2><ul>';
  for (const trophy of nextUp) {
    html += "<li>" + escapeHtml(trophy.name) + " (" + escapeHtml(trophy.grade) + ")</li>";
  }
  html += "</ul></div>";
  html += "</div>";
  return html;
}
