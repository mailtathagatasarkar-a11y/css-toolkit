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

async function describeSelection() {
  const selection = figma.currentPage.selection;
  const node = selection[0];
  if (!node) return { node: null, count: 0 };
  const info = { name: node.name, type: node.type, width: null, height: null, fontSize: null, css: {}, frame: topLevelFrame(node) };
  if ("width" in node) { info.width = round(node.width); info.height = round(node.height); }
  if (node.type === "TEXT" && typeof node.fontSize === "number") info.fontSize = round(node.fontSize);
  if ("getCSSAsync" in node) {
    try { info.css = await node.getCSSAsync(); } catch (error) { info.css = {}; }
  }
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
