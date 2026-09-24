// CSS Toolkit, Figma plugin main thread. It only reads the document: it sends the selected
// layer's size, font size and CSS to the UI, and never edits the file.

const WIDTH = 400;
const round = n => Math.round(n * 100) / 100;

figma.showUI(__html__, { width: WIDTH, height: 640, themeColors: false, title: "CSS Toolkit" });

// The frame a layer lives in (the child of the page or section), used as the vw/vh viewport.
function topLevelFrame(node) {
  let current = node;
  while (current.parent && current.parent.type !== "PAGE" && current.parent.type !== "SECTION") current = current.parent;
  return "width" in current ? { name: current.name, width: round(current.width), height: round(current.height) } : null;
}

// Figma's CSS references bound variables as var(--name). Resolve each one for this layer (library
// variables included) so the UI can inline plain values for email and add fallbacks for Tailwind.
const hex = c => "#" + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
const colour = c => (c.a === undefined || c.a === 1) ? hex(c) : `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${round(c.a)})`;

function boundVariableIds(node) {
  const ids = new Set();
  const walk = value => {
    if (!value) return;
    if (Array.isArray(value)) value.forEach(walk);
    else if (value.type === "VARIABLE_ALIAS" && value.id) ids.add(value.id);
    else if (typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(node.boundVariables);
  for (const key of ["fills", "strokes", "effects"]) if (Array.isArray(node[key])) node[key].forEach(paint => walk(paint.boundVariables));
  return ids;
}

function cssVariableName(variable) {
  const web = variable.codeSyntax && variable.codeSyntax.WEB;
  const custom = web && /--[\w-]+/.exec(web);
  if (custom) return custom[0];
  return "--" + variable.name.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function resolveVariables(node) {
  const values = {};
  for (const id of boundVariableIds(node)) {
    try {
      const variable = await figma.variables.getVariableByIdAsync(id);
      if (!variable) continue;
      const { value } = variable.resolveForConsumer(node);
      values[cssVariableName(variable)] = typeof value === "number" ? `${round(value)}px`
        : value && typeof value === "object" && "r" in value ? colour(value) : String(value);
    } catch (error) { /* A variable we can't resolve stays as var() in the output. */ }
  }
  return values;
}

async function describeSelection() {
  const selection = figma.currentPage.selection;
  const node = selection[0];
  if (!node) return { node: null, count: 0 };
  const info = { name: node.name, type: node.type, width: null, height: null, fontSize: null, css: {}, variables: {}, frame: topLevelFrame(node) };
  if ("width" in node) { info.width = round(node.width); info.height = round(node.height); }
  if (node.type === "TEXT" && typeof node.fontSize === "number") info.fontSize = round(node.fontSize);
  if ("getCSSAsync" in node) {
    try { info.css = await node.getCSSAsync(); } catch (error) { info.css = {}; }
  }
  info.variables = await resolveVariables(node);
  return { node: info, count: selection.length };
}

async function sendSelection() {
  figma.ui.postMessage({ type: "selection", ...(await describeSelection()) });
}

figma.on("selectionchange", sendSelection);
figma.on("currentpagechange", sendSelection);

figma.ui.onmessage = msg => {
  if (msg.type === "ready") sendSelection();
  if (msg.type === "resize") figma.ui.resize(WIDTH, Math.max(360, Math.min(820, Math.ceil(msg.height))));
  if (msg.type === "notify") figma.notify(msg.text, { timeout: 1500 });
  if (msg.type === "open" && /^https:\/\//.test(msg.url)) figma.openExternal(msg.url);
};
