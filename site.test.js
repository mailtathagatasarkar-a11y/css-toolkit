import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_FILES } from "./scripts/build-site.mjs";

const read = file => readFileSync(new URL(`./${file}`, import.meta.url), "utf8");

test("every file the page references ships in the site build", () => {
  const html = read("index.html");
  const referenced = [...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map(m => m[1]);
  for (const file of referenced) assert.ok(SITE_FILES.includes(file), `index.html needs ${file}`);
});

test("every module imported by shipped JavaScript ships too", () => {
  for (const file of SITE_FILES.filter(f => f.endsWith(".js"))) {
    for (const [, dep] of read(file).matchAll(/^import .* from "\.\/([^"]+)";/gm)) {
      assert.ok(SITE_FILES.includes(dep), `${file} imports ${dep}`);
    }
  }
});
