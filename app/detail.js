// Trophy detail panel: guide, steps, sources, and the honest flags.
// A guide that cites no source gets no credit, so every trophy shows its
// sources. Unconfirmed trophies say so in plain language instead of
// pretending the steps are verified.

import { displayName, trophyIsHiddenBySpoiler } from './filters.js';

export function renderDetail(detailEl, trophy, earned, spoilerOn, onToggle) {
  if (!trophy) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to see its guide, steps and sources.</p>';
    return;
  }

  const hidden = trophyIsHiddenBySpoiler(trophy, earned, spoilerOn);
  const isEarned = earned.has(trophy.id);
  const el = document.createElement('div');

  const title = document.createElement('h2');
  title.textContent = displayName(trophy, earned, spoilerOn);
  el.appendChild(title);

  const head = document.createElement('div');
  head.className = 'trophy-head';
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
  el.appendChild(head);

  if (hidden) {
    const note = document.createElement('p');
    note.textContent = 'This is a story trophy you have not earned yet, so its name, description and guide stay hidden while spoiler mode is on. Earn it in the game, tick it here, and it will reveal itself.';
    el.appendChild(note);
  } else {
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = `Official description: “${trophy.description}”`;
    el.appendChild(official);

    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'Guide';
    el.appendChild(guideHeading);
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    el.appendChild(guide);

    if (trophy.steps && trophy.steps.length > 0) {
      const stepsHeading = document.createElement('h3');
      stepsHeading.textContent = 'Steps';
      el.appendChild(stepsHeading);
      const list = document.createElement('ol');
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        list.appendChild(li);
      }
      el.appendChild(list);
    }

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    el.appendChild(sourcesHeading);
    const sources = document.createElement('ul');
    sources.className = 'sources';
    for (const source of trophy.sources) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      li.appendChild(link);
      if (source.note) {
        const note = document.createElement('span');
        note.className = 'src-label';
        note.textContent = ` — ${source.note}`;
        li.appendChild(note);
      }
      sources.appendChild(li);
    }
    el.appendChild(sources);
  }

  if (trophy.missable) {
    const callout = document.createElement('div');
    callout.className = 'callout missable';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — the only one in the game';
    callout.appendChild(strong);
    callout.appendChild(document.createTextNode('This is the only trophy with a time limit. Do the balcony meditation with Lucia in Chapter 1, the morning after “Down to Earth”. If you pass Chapter 1 without it, it may be gone for this playthrough.'));
    el.appendChild(callout);
  }

  if (trophy.unconfirmed) {
    const callout = document.createElement('div');
    callout.className = 'callout unconfirmed';
    const strong = document.createElement('strong');
    strong.textContent = 'Not fully confirmed yet';
    callout.appendChild(strong);
    callout.appendChild(document.createTextNode(trophy.unconfirmed));
    el.appendChild(callout);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = isEarned ? 'mark-btn earned' : 'mark-btn';
  button.textContent = isEarned ? '✓ Earned — click to unmark' : 'Mark as earned';
  button.addEventListener('click', () => onToggle(trophy.id));
  el.appendChild(button);

  detailEl.replaceChildren(el);
}
