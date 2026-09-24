// Figma bridge (plugin UI only): fills the tools from the selected layer, sizes the plugin window
// to its content, and routes external links and copy notices through the main thread.

const post = message => parent.postMessage({ pluginMessage: message }, "*");
const selectionBar = $("#selection-bar");
let selection = { node: null, count: 0 };

const px = value => `${Number(value.toFixed(2))}px`;
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "layer";
const escapeText = text => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function cssRule(node) {
  const body = Object.entries(node.css || {}).map(([prop, value]) => `  ${prop}: ${value};`).join("\n");
  return `.${slug(node.name)} {\n${body}\n}`;
}

// Actions that make sense for the open tool, given what the selected layer has.
function actionsFor(node) {
  const mode = state.mode;
  const actions = [];
  const hasCss = node.css && Object.keys(node.css).length > 0;
  if (mode === "rem" || mode === "vw" || mode === "vh") {
    if (node.fontSize) actions.push({ id: "font", label: `Font ${px(node.fontSize)}` });
    if (node.width !== null) actions.push({ id: "width", label: `W ${px(node.width)}` });
    if (node.height !== null) actions.push({ id: "height", label: `H ${px(node.height)}` });
  } else if (mode === "em") {
    if (node.fontSize) actions.push({ id: "parent", label: `Parent font ${px(node.fontSize)}` });
  } else if (hasCss) {
    actions.push({ id: "css", label: "Use layer CSS" });
  }
  return actions;
}

function apply(id) {
  const node = selection.node;
  if (!node) return;
  if (id === "font" || id === "width" || id === "height") {
    const value = id === "font" ? node.fontSize : node[id];
    leftInput.value = Number(value.toFixed(2));
    syncFromLeft();
  } else if (id === "parent") {
    const parentInput = $("#parent");
    parentInput.value = node.fontSize;
    parentInput.dispatchEvent(new Event("input"));
  } else if (id === "css") {
    const rule = cssRule(node);
    codeInput.value = state.mode === "inline"
      ? `<style>\n${rule}\n</style>\n<div class="${slug(node.name)}">${escapeText(node.name)}</div>`
      : rule;
    runTool();
  }
}

// The value most people want from a fresh selection in each tool.
function autoApply() {
  const node = selection.node;
  if (!node) return;
  const preferred = { rem: node.fontSize ? "font" : "width", vw: "width", vh: "height", em: "parent", inline: "css", tailwind: "css" }[state.mode];
  if (actionsFor(node).some(a => a.id === preferred)) apply(preferred);
}

function renderSelection() {
  const node = selection.node;
  if (!node) {
    selectionBar.innerHTML = `<span class="selection-empty">Select a layer to fill values from it.</span>`;
    return;
  }
  const size = node.width !== null ? ` · ${Number(node.width.toFixed(2))} × ${Number(node.height.toFixed(2))}` : "";
  const more = selection.count > 1 ? ` <small>(+${selection.count - 1} more, using the first)</small>` : "";
  const actions = actionsFor(node);
  selectionBar.innerHTML = `
    <div class="selection-name"><b>${escapeText(node.name)}</b>${size}${more}</div>
    ${actions.length ? `<div class="selection-actions">${actions.map(a => `<button type="button" class="chip" data-apply="${a.id}">${a.label}</button>`).join("")}</div>` : `<span class="selection-empty">Nothing to use from this layer in this tool.</span>`}`;
  selectionBar.querySelectorAll("[data-apply]").forEach(button => button.addEventListener("click", () => apply(button.dataset.apply)));
}

// In Figma the viewport is the selected layer's frame, not the plugin window. Until something is
// selected, assume a common 1440 × 900 desktop frame.
state.settings.viewportWidth = 1440;
state.settings.viewportHeight = 900;

function useFrameAsViewport() {
  const frame = selection.node && selection.node.frame;
  if (!frame) return false;
  state.settings.viewportWidth = Math.round(frame.width);
  state.settings.viewportHeight = Math.round(frame.height);
  return true;
}

// Swap the site's "Use this window" for "Use frame size" whenever the settings re-render.
const renderSiteSettings = renderSettings;
renderSettings = function () {
  renderSiteSettings();
  const detect = $("#detect-viewport");
  if (!detect) return;
  const frame = selection.node && selection.node.frame;
  const button = detect.cloneNode(false);
  button.textContent = frame ? `Use frame "${frame.name}"` : "Use frame size";
  button.title = frame ? `${frame.width} × ${frame.height}` : "Select a layer inside a frame";
  button.disabled = !frame;
  button.addEventListener("click", () => { if (useFrameAsViewport()) { renderSettings(); resync(); } });
  detect.replaceWith(button);
};

window.addEventListener("message", event => {
  const message = event.data && event.data.pluginMessage;
  if (!message || message.type !== "selection") return;
  selection = message;
  useFrameAsViewport();
  if (!(state.mode in tools)) renderSettings();
  renderSelection();
  autoApply();
  if (!(state.mode in tools)) resync();
});

tabs.forEach(tab => tab.addEventListener("click", renderSelection));

// Links leave the sandboxed frame through figma.openExternal.
document.addEventListener("click", event => {
  const link = event.target.closest("a[href^='https://']");
  if (!link) return;
  event.preventDefault();
  post({ type: "open", url: link.href });
});

[copyButton, $("#copy-code")].forEach(button => button.addEventListener("click", () => post({ type: "notify", text: "Copied to clipboard" })));

const shell = document.querySelector("main");
new ResizeObserver(() => post({ type: "resize", height: shell.offsetHeight })).observe(shell);

if (!(state.mode in tools)) { renderSettings(); resync(); }
renderSelection();
post({ type: "ready" });
