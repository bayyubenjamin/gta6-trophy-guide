// filters.js — filtering and spoiler masking for the trophy list.
// Pure functions: they take the trophy array and a filter object and return
// a new array. No DOM, no storage, so they are easy to test in isolation.

export function filterTrophies(trophies, options) {
  const kind = options.kind || "all";
  const grade = options.grade || "all";
  const query = (options.query || "").trim().toLowerCase();
  const out = [];
  for (const trophy of trophies) {
    if (kind !== "all" && trophy.kind !== kind) continue;
    if (grade !== "all" && trophy.grade !== grade) continue;
    if (query) {
      const haystack = (trophy.name + " " + trophy.description + " " + trophy.kind + " " + trophy.grade).toLowerCase();
      if (!haystack.includes(query)) continue;
    }
    out.push(trophy);
  }
  return out;
}

// Spoiler mode hides the name, description and guide of story trophies the
// user has not earned yet. Missable, collectible and activity trophies are
// never hidden, because their names are not story spoilers.
export function isSpoilerHidden(trophy, spoilerOn, isEarned) {
  if (!spoilerOn) return false;
  if (isEarned) return false;
  return trophy.kind === "story";
}

export function spoilerLabel() {
  return "Hidden story trophy — earn it to reveal its name and guide.";
}

export function countByKind(trophies, isEarned) {
  const counts = {};
  for (const trophy of trophies) {
    if (!counts[trophy.kind]) counts[trophy.kind] = { total: 0, earned: 0 };
    counts[trophy.kind].total += 1;
    if (isEarned(trophy.id)) counts[trophy.kind].earned += 1;
  }
  return counts;
}

export function countByGrade(trophies, isEarned) {
  const counts = {};
  for (const trophy of trophies) {
    if (!counts[trophy.grade]) counts[trophy.grade] = { total: 0, earned: 0 };
    counts[trophy.grade].total += 1;
    if (isEarned(trophy.id)) counts[trophy.grade].earned += 1;
  }
  return counts;
}
