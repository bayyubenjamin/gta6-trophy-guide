// Filtering and spoiler masking for the checklist.
// Spoiler mode hides the name and description of story trophies the player
// has not earned yet; the guide for a hidden trophy stays hidden too,
// because a guide that says where a story trophy pops is itself a spoiler.
// Missable and activity trophies are never hidden: their whole point is
// that the player needs to know about them in advance.

export function trophyIsHiddenBySpoiler(trophy, earned, spoilerOn) {
  if (!spoilerOn) return false;
  if (earned.has(trophy.id)) return false;
  return trophy.kinds.includes('story');
}

export function filterTrophies(trophies, earned, state) {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind !== 'all' && !trophy.kinds.includes(state.kind)) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function displayName(trophy, earned, spoilerOn) {
  return trophyIsHiddenBySpoiler(trophy, earned, spoilerOn) ? 'Hidden story trophy' : trophy.name;
}
