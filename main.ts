// main.ts — entrypoint for the Leonida Trophy Guide.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json there, using the kit's buildDossier
// library. Run it as `node main.ts` from the repository root.
// MAKEFUN_OUTPUT_DIR stands in for /output outside the grader.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = import.meta.dirname;
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function copyTree(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true, dereference: false });
}

function build(): void {
  const appDir = join(repoRoot, "app");
  const shotsDir = join(repoRoot, "screenshots");
  if (!existsSync(appDir)) {
    throw new Error("app/ is missing from the repository");
  }
  if (!existsSync(shotsDir)) {
    throw new Error("screenshots/ is missing from the repository");
  }
  const shotFiles = readdirSync(shotsDir).filter((name) => !name.startsWith("."));
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    throw new Error("screenshots/ must hold 3 or 4 images, found " + shotFiles.length);
  }
  mkdirSync(outDir, { recursive: true });
  const outApp = join(outDir, "app");
  const outShots = join(outDir, "screenshots");
  rmSync(outApp, { recursive: true, force: true });
  rmSync(outShots, { recursive: true, force: true });
  copyTree(appDir, outApp);
  copyTree(shotsDir, outShots);
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
}

build();
