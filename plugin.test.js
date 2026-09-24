import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildPlugin } from "./scripts/build-plugin.mjs";

test("builds a single-file plugin UI with every tool and no module syntax", () => {
  const html = buildPlugin();
  assert.match(html, /<section class="calculator"/);
  for (const mode of ["rem", "em", "vw", "vh", "inline", "tailwind"]) assert.match(html, new RegExp(`data-mode="${mode}"`));
  assert.doesNotMatch(html, /\/\*(STYLES|LOGO|CALCULATOR|SCRIPT)\*\//);
  assert.doesNotMatch(html, /^\s*(import|export)\s/m);
  assert.doesNotMatch(html, /src="\.\/[^"]+\.js"/, "no external scripts: Figma inlines the UI");
});

test("plugin manifest points at the built files", () => {
  const manifest = JSON.parse(readFileSync(new URL("./figma-plugin/manifest.json", import.meta.url), "utf8"));
  assert.equal(manifest.main, "code.js");
  assert.equal(manifest.ui, "ui.html");
  assert.ok(manifest.editorType.includes("figma"));
  assert.equal(manifest.id, "1684920820196716785", "Published Community ID: updates must keep it");
});

test("committed figma-plugin/ui.html is up to date with the source", () => {
  const normalise = text => text.replace(/\r\n/g, "\n");
  const committed = normalise(readFileSync(new URL("./figma-plugin/ui.html", import.meta.url), "utf8"));
  assert.equal(committed, normalise(buildPlugin()), "Run npm run build:plugin and commit figma-plugin/ui.html");
});
