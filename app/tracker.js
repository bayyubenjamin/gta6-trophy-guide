// tracker.js — checklist state for the Leonida Trophy Guide.
// State lives in two places: the earned set (persisted to localStorage) and
// an optional demo set (in memory only, used by ?demo=1 for screenshots).
// Demo mode never writes to localStorage.

export const STORAGE_KEY = "leonida-trophy-guide-earned-v1";

// Fixed demo set: 18 trophies pre-ticked in memory for screenshots.
// Story through Chapter 2 plus a few early activities, so progress reads 18/55.
export const DEMO_EARNED_IDS = [2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 20, 21, 28, 35, 42];

export function createTracker(demoMode) {
  const earned = new Set();
  const demo = new Set(demoMode ? DEMO_EARNED_IDS : []);
  let dirty = false;

  function load() {
    if (demoMode) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (Number.isInteger(id)) earned.add(id);
        }
      }
    } catch (err) {
      // A corrupt saved value must not break the guide; start empty.
    }
  }

  function save() {
    if (demoMode) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
      dirty = false;
    } catch (err) {
      // Storage can be unavailable (private mode, quota); the in-memory set still works.
    }
  }

  function isEarned(id) {
    if (demoMode) return demo.has(id);
    return earned.has(id);
  }

  function toggle(id) {
    if (demoMode) {
      if (demo.has(id)) demo.delete(id); else demo.add(id);
      return isEarned(id);
    }
    if (earned.has(id)) earned.delete(id); else earned.add(id);
    dirty = true;
    save();
    return earned.has(id);
  }

  function earnedCount() {
    return demoMode ? demo.size : earned.size;
  }

  function earnedIds() {
    const source = demoMode ? demo : earned;
    return [...source].sort((a, b) => a - b);
  }

  function exportState() {
    return JSON.stringify({ version: 1, earned: earnedIds() }, null, 2);
  }

  function importState(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.earned)) {
      throw new Error("Import file is not a Leonida Trophy Guide export.");
    }
    if (demoMode) {
      demo.clear();
      for (const id of parsed.earned) {
        if (Number.isInteger(id)) demo.add(id);
      }
      return demo.size;
    }
    earned.clear();
    for (const id of parsed.earned) {
      if (Number.isInteger(id)) earned.add(id);
    }
    dirty = true;
    save();
    return earned.size;
  }

  function isDirty() {
    return dirty;
  }

  // Clears every earned mark. In demo mode it only clears the in-memory
  // demo set; it never touches localStorage either way.
  function clearAll() {
    if (demoMode) {
      demo.clear();
      return 0;
    }
    earned.clear();
    dirty = true;
    save();
    return 0;
  }

  load();
  return { isEarned, toggle, earnedCount, earnedIds, exportState, importState, isDirty, clearAll };
}
