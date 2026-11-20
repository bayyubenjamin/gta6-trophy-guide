// Progress tracker: which trophies are earned, saved in localStorage.
// Keyed by trophy name (names are the stable, official identifiers).
// Everything is guarded: a corrupt or unavailable store never breaks the app.

const STORAGE_KEY = 'leonida-trophy-guide-earned-v1';

export const DEMO_EARNED_IDS = [2, 3, 8, 15, 16, 19, 20, 21, 28, 32, 33, 35, 36, 42, 44, 51, 53, 55];

export function loadEarned(trophies, params) {
  if (params && params.get('demo') === '1') {
    return new Set(DEMO_EARNED_IDS.filter((id) => trophies.some((t) => t.id === id)));
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const known = new Set(trophies.map((t) => t.id));
    return new Set(parsed.filter((id) => typeof id === 'number' && known.has(id)));
  } catch (err) {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch (err) {
    // Private mode / quota: progress still works for this session.
  }
}

export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveEarned(next);
  return next;
}

export function exportEarned(earned, trophies) {
  const names = trophies.filter((t) => earned.has(t.id)).map((t) => t.name);
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', platform: 'PlayStation 5', earned: names }, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophies-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importEarned(file, trophies) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('That file is not valid JSON.');
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('Expected a JSON array of trophy names, or an object with an "earned" array.');
  const byName = new Map(trophies.map((t) => [t.name, t.id]));
  const imported = new Set();
  const unknown = [];
  for (const name of names) {
    if (typeof name !== 'string') continue;
    const id = byName.get(name);
    if (id === undefined) unknown.push(name);
    else imported.add(id);
  }
  saveEarned(imported);
  return { imported, unknown };
}
