// Builds figma-plugin/ui.html. Figma loads a plugin UI as one HTML string, so this inlines the
// site's calculator markup, styles and ES modules (imports/exports stripped, concatenated in
// dependency order) plus the plugin-only bridge. Run: npm run build:plugin
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = file => readFileSync(new URL(file, root), "utf8");

// Order matters: each file may only use names defined above it.
const MODULES = ["logic.js", "tailwind.js", "inline.js", "tools.js", "app.js", "figma-plugin/src/bridge.js"];

const stripModuleSyntax = source => source
  .replace(/^import .* from .*;\r?\n/gm, "")
  .replace(/^export (?=(?:async )?function |const |let |class )/gm, "");

export function buildPlugin() {
  const script = MODULES.map(file => `// ── ${file}\n${stripModuleSyntax(read(file))}`).join("\n");
  if (/^\s*(import|export)\s/m.test(script)) throw new Error("Unstripped module syntax in plugin script");
  if (/<\/script/i.test(script)) throw new Error("Plugin script contains </script>, which would end the inline tag");
  new vm.Script(script, { filename: "ui.html script" }); // Syntax check only; never executed here.

  const page = read("index.html");
  const start = page.indexOf('<section class="calculator"');
  const end = page.indexOf("</section>", start) + "</section>".length;
  if (start === -1 || end < start) throw new Error("Calculator section not found in index.html");

  const logo = `data:image/svg+xml;base64,${Buffer.from(read("favicon.svg")).toString("base64")}`;
  const parts = { STYLES: `${read("styles.css")}\n${read("figma-plugin/src/plugin.css")}`, LOGO: logo, CALCULATOR: page.slice(start, end), SCRIPT: script };
  // Function replacer, so "$" sequences in the sources are inserted literally.
  return read("figma-plugin/src/ui.template.html").replace(/\/\*(STYLES|LOGO|CALCULATOR|SCRIPT)\*\//g, (_, key) => parts[key]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = buildPlugin();
  writeFileSync(new URL("figma-plugin/ui.html", root), html);
  console.log(`figma-plugin/ui.html written (${(html.length / 1024).toFixed(1)} KB)`);
}
