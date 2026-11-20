// html.js — tiny HTML escaping helper shared by the renderers.
// Escapes the five characters that can break out of HTML text or attributes,
// so trophy names and guide text are always rendered as text, never markup.

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Same escaping, for values placed inside a quoted HTML attribute. Kept
// separate so a caller that builds attributes gets the intent right.
export function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
