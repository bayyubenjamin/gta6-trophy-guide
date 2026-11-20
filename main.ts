// GTA 6 trophy guide, make.fun entry gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html opens in a desktop
// browser and works with the network off, and app/data/trophies.json holds the 55
// official trophies with a guide for each. screenshots/ holds four real renders of
// the app in a browser. This program hands the entry in: it copies app/ and
// screenshots/ into the output directory and writes dossier.json there, the summary
// the judge reads (the screenshots, the first load's files and bytes, and the
// source), built with the vendored make.fun library. The library must stay exactly
// as the kit ships it: the scorer rebuilds the dossier with its own copy and
// compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR in place of /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// It is deterministic: two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps match the scorer's gate: at most 4 screenshots of 256 KiB each, app/ at
// most 993 files and directories and 48 MiB, and the dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
