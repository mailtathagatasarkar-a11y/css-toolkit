// Builds the deployable site into dist/: only the files the page needs, never tests, the Figma
// plugin or reference images. Run: npm run build (Netlify runs this on every push).
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const SITE_FILES = [
  "index.html", "styles.css", "favicon.svg", "favicon-32.png", "apple-touch-icon.png",
  "app.js", "logic.js", "tools.js", "inline.js", "tailwind.js",
];

export function buildSite(outDir = new URL("../dist/", import.meta.url)) {
  const root = new URL("../", import.meta.url);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  for (const file of SITE_FILES) cpSync(new URL(file, root), new URL(file, outDir));
  return SITE_FILES.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`dist/ built with ${buildSite()} files`);
}
