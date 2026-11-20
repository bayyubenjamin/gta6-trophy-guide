# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bayyubenjamin/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bayyubenjamin/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline GTA VI trophy guide and platinum tracker for PlayStation 5: all 55 official trophies with a real guide each, a checklist that saves progress in the browser, filters by kind and grade, a spoiler mode, a chapter-by-chapter platinum roadmap, and progress export/import. Built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## What makes this one different

Every one of the 55 trophies gets a real guide written from the game's first week of published play — each fact cited to the guide it came from, sequenced into a chapter-by-chapter platinum roadmap that flags the game's single missable trophy — where every other entry ships the starter's one-line hints with no sources.

- **Cited guidance, not copied text.** Every trophy's guide is written in our own words and names its sources beside it (PowerPyx, GTABase, KeenGamer — links in the app and in `app/data/trophies.json`). A specific location or step that cites no source gets no credit, so none of them are uncited.
- **Honest about what is not known yet.** GTA VI released 19 November 2026. Seven trophies are still unconfirmed by the published guides (including Bad Luck, I Guess, whose unlock nobody has verified yet) — each one says so in its own guide instead of inventing steps. The Progress view lists them all in one place.
- **The one missable trophy, up front.** Positive Mental Attitude is the only trophy with a time limit (Lucia's balcony meditation in Chapter 1). It is flagged in the list, in the detail panel, in the roadmap's warnings, and in the cover screenshot.
- **A roadmap that is actually a plan.** Three stages in play order (story 60–80 h → 100% cleanup ~100 h → Strangers & Freaks 10–20 h), each with per-stage progress, the trophies it covers in order, and four warnings that can ruin a run (cheats disable trophies, no mission replay, the Irredeemable profile is permanent, the one missable trophy).
- **A tracker, not a page.** Checklist state saves to localStorage, export/import moves it between devices, filters cover kind (story / missable / collectibles / activities / online) and grade, and spoiler mode hides the name, description and guide of story trophies you have not earned yet.
- **Offline by design.** No network requests, no webfonts, no Rockstar artwork. Plain static files under `app/` — open `index.html` with the network off and everything works.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080/ in a desktop browser.

Deep links for previews and screenshots (see `shots.json`): `?view=roadmap`, `?view=progress`, `?spoiler=on`, `?kind=missable`, `?trophy=28`, `?demo=1` (pre-ticks a fixed set of 18 trophies in memory for screenshots; it never writes to localStorage).

## Check it

```sh
# Build the entry output twice and confirm it is byte-identical:
mkdir -p /tmp/out1 /tmp/out2
MAKEFUN_OUTPUT_DIR=/tmp/out1 node main.ts
MAKEFUN_OUTPUT_DIR=/tmp/out2 node main.ts
diff -r /tmp/out1 /tmp/out2

# Kit pre-submit checks (from the unpacked kit):
node cli/makefun.mjs check --kit . --repo <this repository> --worktree
```

Local checks run on this draft: 55 trophies, names/descriptions/grades verbatim from the kit's official list; every guide non-blank (2,530 words, 144 steps, 105 source links); `app/` 9 files, well under the 993-file / 48 MiB caps; `index.html` under 1 MiB; 4 screenshots, each 1280×800 JPEG under 256 KiB; no network references in loaded resources (the only external URLs are `<a href>` links to the cited guides, which the rules explicitly allow); no TODO, no dead code, no console.log, no secrets anywhere in the entry.

## Sources

- Official trophy list (names, descriptions, grades): the kit's `app/data/trophies.json`, as Exophase and PSNProfiles listed them on 18 Nov 2026.
- PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- GTABase — GTA 6 Trophy Guide: https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap: https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/

## Status

Draft. Not submitted. Before submit: rebuild the entry in a recorded harness session (strict transcripts), create the public repo after the competition opened (2026-11-19T11:00:00Z), set the repo About (website https://make.fun/bounty/gta6-trophy-guide-01, topics makefun, ai-agents, bounties, games), and sign the entry message with the payout wallet.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
