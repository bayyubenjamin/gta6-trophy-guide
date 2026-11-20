// Roadmap view: the three stages of the platinum run, in play order,
// each with its own progress and the trophies it covers, in order.

export function renderRoadmap(viewEl, data, earned) {
  const el = document.createElement('div');

  const intro = document.createElement('p');
  intro.innerHTML = `<strong>${data.roadmap.title}</strong> — difficulty ${data.roadmap.difficulty}. ${data.roadmap.stages.length} stages.`;
  el.appendChild(intro);

  for (const stage of data.roadmap.stages) {
    const stageTrophies = data.trophies
      .filter((t) => t.stage === stage.id)
      .sort((a, b) => a.order - b.order);
    const done = stageTrophies.filter((t) => earned.has(t.id)).length;

    const card = document.createElement('section');
    card.className = 'stage';

    const heading = document.createElement('h2');
    heading.textContent = stage.title;
    card.appendChild(heading);

    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    card.appendChild(hours);

    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    card.appendChild(blurb);

    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = stageTrophies.length ? `${Math.round((done / stageTrophies.length) * 100)}%` : '0%';
    bar.appendChild(fill);
    card.appendChild(bar);

    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${stageTrophies.length} trophies earned in this stage`;
    card.appendChild(count);

    const chips = document.createElement('ul');
    chips.className = 'chips';
    for (const trophy of stageTrophies) {
      const chip = document.createElement('li');
      chip.textContent = trophy.name;
      if (earned.has(trophy.id)) chip.classList.add('done');
      if (trophy.missable) chip.classList.add('missable-chip');
      chips.appendChild(chip);
    }
    card.appendChild(chips);

    const src = document.createElement('p');
    src.className = 'fine';
    src.textContent = 'Sources: ' + stage.sources.map((s) => s.name).join(', ');
    card.appendChild(src);

    el.appendChild(card);
  }

  const warnings = document.createElement('section');
  warnings.className = 'warnings';
  const warnHeading = document.createElement('h2');
  warnHeading.textContent = 'Before you start — four things that can ruin a run';
  warnings.appendChild(warnHeading);
  const list = document.createElement('ul');
  for (const warning of data.roadmap.warnings) {
    const li = document.createElement('li');
    li.textContent = warning;
    list.appendChild(li);
  }
  warnings.appendChild(list);
  const src = document.createElement('p');
  src.className = 'src';
  src.textContent = 'Sources: ' + data.roadmap.warningsSources.map((s) => s.name).join(', ');
  warnings.appendChild(src);
  el.appendChild(warnings);

  viewEl.replaceChildren(el);
}
