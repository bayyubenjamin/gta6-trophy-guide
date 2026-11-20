// roadmap.js — renders the platinum roadmap.
// Three stages in play order, each with its own progress and the trophies it
// covers, plus the four warnings that can ruin a run. Stage membership comes
// from each trophy's `stage` field in the data file.

import { escapeHtml } from "./html.js";

export const STAGES = [
  { number: 1, title: "Story", hours: "60–80 hours", blurb: "Play the story from Chapter 1 to the finale. Do the missable meditation in Chapter 1." },
  { number: 2, title: "100% cleanup", hours: "~100 hours", blurb: "Collectibles, activities, challenges and the 100% completion trophy." },
  { number: 3, title: "Strangers & Freaks", hours: "10–20 hours", blurb: "Finish the stranger strands, then the platinum pops." }
];

export const WARNINGS = [
  "Cheats disable trophies. Never turn a cheat on in a save you care about — the game blocks trophy unlocks while cheats are active.",
  "There is no mission replay. If you miss a story beat, you cannot replay that mission; only a new playthrough gets it back.",
  "The Irredeemable profile is permanent. Once a profile is marked Irredeemable it stays that way, so keep a clean save for the platinum run.",
  "Positive Mental Attitude is the only missable trophy. Meditate on Lucia's balcony in Chapter 1 before the chapter ends — that spot cannot be revisited."
];

export function renderRoadmap(trophies, isEarned) {
  let html = '<div class="stage-grid">';
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.number);
    const done = members.filter((t) => isEarned(t.id)).length;
    const pct = members.length === 0 ? 0 : Math.round((done / members.length) * 100);
    html += '<div class="stage">';
    html += "<h2>Stage " + stage.number + " — " + escapeHtml(stage.title) + "</h2>";
    html += '<p class="stage-hours">' + escapeHtml(stage.hours) + " &middot; " + done + " / " + members.length + " earned (" + pct + "%)</p>";
    html += '<div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div>';
    html += "<p>" + escapeHtml(stage.blurb) + "</p>";
    html += "<ul>";
    for (const trophy of members) {
      const cls = isEarned(trophy.id) ? ' class="done"' : "";
      const flag = trophy.missable ? " (missable)" : "";
      html += "<li" + cls + ">" + escapeHtml(trophy.name) + escapeHtml(flag) + "</li>";
    }
    html += "</ul></div>";
  }
  html += "</div>";
  html += '<div class="warnings"><h2>Warnings that can ruin a run</h2><ul>';
  for (const warning of WARNINGS) {
    html += "<li>" + escapeHtml(warning) + "</li>";
  }
  html += "</ul></div>";
  return html;
}
