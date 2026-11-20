// Progress view: where the run stands, by kind and by grade,
// plus the honest list — trophies whose unlock is still unconfirmed.

const CATEGORIES = [
  { key: 'story', label: 'Story' },
  { key: 'missable', label: 'Missable' },
  { key: 'collectibles', label: 'Collectibles' },
  { key: 'activities', label: 'Activities' },
  { key: 'online', label: 'Online' },
];

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

export function renderProgress(viewEl, trophies, earned) {
  const el = document.createElement('div');

  const byKind = document.createElement('section');
  byKind.className = 'progress-section';
  const byKindHeading = document.createElement('h2');
  byKindHeading.textContent = 'Progress by category';
  byKind.appendChild(byKindHeading);

  for (const category of CATEGORIES) {
    const inCategory = trophies.filter((t) => t.kinds.includes(category.key));
    const done = inCategory.filter((t) => earned.has(t.id)).length;
    const row = document.createElement('div');
    row.className = 'cat-row';

    const label = document.createElement('span');
    label.textContent = category.label;
    row.appendChild(label);

    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = inCategory.length ? `${Math.round((done / inCategory.length) * 100)}%` : '0%';
    bar.appendChild(fill);
    row.appendChild(bar);

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = `${done} / ${inCategory.length}`;
    row.appendChild(num);

    byKind.appendChild(row);
  }

  const onlineNote = document.createElement('p');
  onlineNote.className = 'fine';
  onlineNote.textContent = 'There are 0 online trophies in GTA VI — every trophy is offline single-player, so the platinum is achievable without ever going online.';
  byKind.appendChild(onlineNote);
  el.appendChild(byKind);

  const byGrade = document.createElement('section');
  byGrade.className = 'progress-section';
  const byGradeHeading = document.createElement('h2');
  byGradeHeading.textContent = 'Progress by grade';
  byGrade.appendChild(byGradeHeading);
  const grid = document.createElement('div');
  grid.className = 'grade-grid';
  for (const grade of GRADES) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const done = inGrade.filter((t) => earned.has(t.id)).length;
    const cell = document.createElement('div');
    cell.className = 'grade-cell';
    const strong = document.createElement('strong');
    strong.textContent = `${done} / ${inGrade.length}`;
    cell.appendChild(strong);
    const label = document.createElement('span');
    label.textContent = grade;
    cell.appendChild(label);
    grid.appendChild(cell);
  }
  byGrade.appendChild(grid);
  el.appendChild(byGrade);

  const unconfirmed = trophies.filter((t) => t.unconfirmed);
  const honest = document.createElement('section');
  honest.className = 'progress-section';
  const honestHeading = document.createElement('h2');
  honestHeading.textContent = 'What is still unconfirmed';
  honest.appendChild(honestHeading);
  const honestIntro = document.createElement('p');
  honestIntro.textContent = 'GTA VI released on 19 November 2026. These trophies are not fully confirmed by the published guides yet — each one says so in its own guide instead of pretending otherwise:';
  honest.appendChild(honestIntro);
  const list = document.createElement('ul');
  for (const trophy of unconfirmed) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = trophy.name;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(` — ${trophy.unconfirmed}`));
    list.appendChild(li);
  }
  honest.appendChild(list);
  el.appendChild(honest);

  viewEl.replaceChildren(el);
}
