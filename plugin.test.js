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
});
