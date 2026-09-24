import { convert, converters, describe, VIEWPORT_PRESETS } from "./logic.js";
import { tools } from "./tools.js";

// Where visitors can buy the maker a coffee. Empty hides every coffee link.
const COFFEE_URL = "https://buymeacoffee.com/98kid";

const CATALOG = [
  { mode: "rem", pair: "PX ⇄ REM", title: "PX to REM", text: "Convert pixels to rem and back, against any root font size." },
  { mode: "em", pair: "REM ⇄ EM", title: "REM to EM", text: "Work out em values from the root and parent font sizes." },
  { mode: "vw", pair: "PX ⇄ VW", title: "PX to VW", text: "Turn pixel widths into viewport-width units, with common screen presets." },
  { mode: "vh", pair: "PX ⇄ VH", title: "PX to VH", text: "Turn pixel heights into viewport-height units, with common screen presets." },
  { mode: "inline", pair: "CSS → INLINE", title: "CSS to Inline", text: "Move <style> rules into inline style attributes for email templates." },
  { mode: "tailwind", pair: "CSS → TAILWIND", title: "CSS to Tailwind", text: "Convert CSS rules, hover states and breakpoints into Tailwind v4 classes." },
];

const state = {
  mode: "rem",
  settings: {
    root: 16,
    parent: 16,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    decimals: 3,
  },
  lastDirection: "toRight",
  code: {},
};

const $ = (selector) => document.querySelector(selector);
const tabs = [...document.querySelectorAll(".tab[data-mode]")];
const leftInput = $("#left-value");
const rightInput = $("#right-value");
const leftUnit = $("#left-unit");
const rightUnit = $("#right-unit");
const leftLabel = $("#left-label");
const rightLabel = $("#right-label");
const settingsArea = $("#settings-area");
const contextLine = $("#context-line");
const formulaLine = $("#formula");
const decimalChips = [...document.querySelectorAll("[data-decimals]")];
const unitView = $("#unit-view");
const codeView = $("#code-view");
const codeInput = $("#code-input");
const codeOutput = $("#code-output");
const codeOptions = $("#code-options");
const codeStatus = $("#code-status");
const exampleButton = $("#code-example");
const heroHint = $("#hero-hint");
const unitHint = heroHint?.textContent ?? "";
const copyButton = $("#copy-result");

// Clipboard API is blocked in some sandboxed frames (like Figma plugins); fall back to execCommand.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = Object.assign(document.createElement("textarea"), { value: text });
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function format(value) {
  return (Number.isFinite(value) ? value : 0).toFixed(state.settings.decimals);
}

function syncFromLeft() {
  state.lastDirection = "toRight";
  rightInput.value = format(convert(state.mode, "toRight", leftInput.value, state.settings));
  updateContext();
}

function syncFromRight() {
  state.lastDirection = "toLeft";
  leftInput.value = format(convert(state.mode, "toLeft", rightInput.value, state.settings));
  updateContext();
}

// Settings changes recompute whichever field the user did not type into.
function resync() {
  if (state.lastDirection === "toLeft") syncFromRight();
  else syncFromLeft();
}

function isActiveViewport(width, height) {
  return width === state.settings.viewportWidth && height === state.settings.viewportHeight;
}

function viewportPresets() {
  return `
      <div class="presets presets--viewport" aria-label="Viewport presets">
        ${VIEWPORT_PRESETS.map(({ width, height }) => `<button type="button" data-viewport="${width}x${height}" class="chip ${isActiveViewport(width, height) ? "is-active" : ""}">${width}×${height}</button>`).join("")}
      </div>`;
}

function renderSettings() {
  const fields = {
    rem: `
      <label class="control control--wide">Root font size
        <span class="input-wrap input-wrap--small"><input id="root" type="number" min="1" step="1" value="${state.settings.root}"><b>px</b></span>
      </label>
      <div class="presets" aria-label="Root font presets">
        ${[14, 16, 18, 20].map(value => `<button type="button" data-root="${value}" class="chip ${value === state.settings.root ? "is-active" : ""}">${value}px</button>`).join("")}
      </div>`,
    em: `
      <label class="control">Root font size
        <span class="input-wrap input-wrap--small"><input id="root" type="number" min="1" value="${state.settings.root}"><b>px</b></span>
      </label>
      <label class="control">Parent font size
        <span class="input-wrap input-wrap--small"><input id="parent" type="number" min="1" value="${state.settings.parent}"><b>px</b></span>
      </label>`,
    vw: `
      <label class="control control--wide">Viewport width
        <span class="input-wrap input-wrap--small"><input id="viewportWidth" type="number" min="1" value="${state.settings.viewportWidth}"><b>px</b></span>
      </label>
      <button class="detect-button" type="button" id="detect-viewport">Use this window</button>${viewportPresets()}`,
    vh: `
      <label class="control control--wide">Viewport height
        <span class="input-wrap input-wrap--small"><input id="viewportHeight" type="number" min="1" value="${state.settings.viewportHeight}"><b>px</b></span>
      </label>
      <button class="detect-button" type="button" id="detect-viewport">Use this window</button>${viewportPresets()}`,
  };

  settingsArea.innerHTML = fields[state.mode];
  settingsArea.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      const value = Math.max(1, Number(input.value) || 1);
      state.settings[input.id] = value;
      settingsArea.querySelectorAll("[data-viewport]").forEach(chip => {
        const [width, height] = chip.dataset.viewport.split("x").map(Number);
        chip.classList.toggle("is-active", isActiveViewport(width, height));
      });
      resync();
    });
  });
  settingsArea.querySelectorAll("[data-root]").forEach(button => {
    button.addEventListener("click", () => {
      state.settings.root = Number(button.dataset.root);
      renderSettings();
      resync();
    });
  });
  settingsArea.querySelectorAll("[data-viewport]").forEach(button => {
    button.addEventListener("click", () => {
      [state.settings.viewportWidth, state.settings.viewportHeight] = button.dataset.viewport.split("x").map(Number);
      renderSettings();
      resync();
    });
  });
  $("#detect-viewport")?.addEventListener("click", () => {
    const key = state.mode === "vw" ? "viewportWidth" : "viewportHeight";
    state.settings[key] = state.mode === "vw" ? window.innerWidth : window.innerHeight;
    renderSettings();
    resync();
  });
}

function updateContext() {
  const fromLeft = state.lastDirection === "toRight";
  const source = fromLeft ? leftInput.value : rightInput.value;
  const result = fromLeft ? rightInput.value : leftInput.value;
  const { expression, worked } = describe(state.mode, state.lastDirection, source, result, state.settings);
  formulaLine.textContent = expression;
  contextLine.textContent = worked;
}

// Output wraps only between tokens: each word (a class name, an attribute) is kept whole, since
// browsers would otherwise break "gap-1" after its hyphen. Very long tokens may still wrap.
function showOutput(text) {
  codeOutput.replaceChildren(...text.split(/(\s+)/).filter(Boolean).map(part => {
    if (/^\s/.test(part) || part.length > 48) return document.createTextNode(part);
    return Object.assign(document.createElement("span"), { textContent: part });
  }));
}

function runTool() {
  const tool = tools[state.mode];
  const input = codeInput.value;
  state.code[state.mode].input = input;
  if (!input.trim()) {
    showOutput("");
    codeStatus.textContent = "Paste code on the left, or load an example.";
    return;
  }
  try {
    const { output, status } = tool.run(input, state.code[state.mode].options);
    showOutput(output);
    codeStatus.textContent = status;
  } catch (error) {
    codeStatus.textContent = `Could not convert: ${error.message}`;
  }
}

function renderCodeOptions() {
  const tool = tools[state.mode];
  const { options } = state.code[state.mode];
  const examples = Object.keys(tool.examples);
  const toggles = tool.options.map(o => `<button type="button" class="chip ${options[o.key] ? "is-active" : ""}" data-option="${o.key}" aria-pressed="${options[o.key]}">${o.label.replace(/</g, "&lt;")}</button>`);
  const exampleChips = examples.length > 1 ? examples.map(name => `<button type="button" class="chip" data-example="${name}">${name}</button>`) : [];
  codeOptions.innerHTML = [...toggles, ...exampleChips].join("");
  exampleButton.hidden = examples.length > 1;
  codeOptions.querySelectorAll("[data-option]").forEach(chip => chip.addEventListener("click", () => {
    options[chip.dataset.option] = !options[chip.dataset.option];
    renderCodeOptions();
    runTool();
  }));
  codeOptions.querySelectorAll("[data-example]").forEach(chip => chip.addEventListener("click", () => loadExample(chip.dataset.example)));
}

function loadExample(name = Object.keys(tools[state.mode].examples)[0]) {
  codeInput.value = tools[state.mode].examples[name];
  runTool();
}

function showTool(mode) {
  const tool = tools[mode];
  state.code[mode] ??= { input: tool.examples[Object.keys(tool.examples)[0]], options: Object.fromEntries(tool.options.map(o => [o.key, o.value])) };
  $("#code-input-label").textContent = tool.inputLabel;
  $("#code-output-label").textContent = tool.outputLabel;
  $("#code-heading").textContent = tool.heading;
  codeInput.placeholder = tool.placeholder;
  codeInput.value = state.code[mode].input;
  if (heroHint) heroHint.textContent = tool.hint;
  renderCodeOptions();
  runTool();
}

function setMode(mode) {
  state.mode = mode;
  document.documentElement.dataset.mode = mode;
  tabs.forEach(tab => tab.classList.toggle("is-active", tab.dataset.mode === mode));
  const isTool = mode in tools;
  unitView.hidden = isTool;
  codeView.hidden = !isTool;
  if (isTool) return showTool(mode);
  if (heroHint) heroHint.textContent = unitHint;
  const c = converters[mode];
  leftLabel.textContent = c.leftLabel;
  rightLabel.textContent = c.rightLabel;
  leftUnit.textContent = c.leftUnit;
  rightUnit.textContent = c.rightUnit;
  leftInput.value = c.defaultLeft;
  state.lastDirection = "toRight";
  renderSettings();
  syncFromLeft();
}

tabs.forEach(tab => tab.addEventListener("click", () => {
  setMode(tab.dataset.mode);
  try { history.replaceState(null, "", `#/tool/${tab.dataset.mode}`); } catch { /* sandboxed frame (Figma plugin) */ }
}));
decimalChips.forEach(chip => chip.addEventListener("click", () => {
  state.settings.decimals = Number(chip.dataset.decimals);
  decimalChips.forEach(other => other.classList.toggle("is-active", other === chip));
  resync();
}));
leftInput.addEventListener("input", syncFromLeft);
rightInput.addEventListener("input", syncFromRight);
$("#swap").addEventListener("click", () => {
  const previous = leftInput.value;
  leftInput.value = rightInput.value;
  rightInput.value = previous;
  syncFromLeft();
});
copyButton.addEventListener("click", async () => {
  const c = converters[state.mode];
  await copyText(`${rightInput.value}${c.rightUnit}`);
  copyButton.textContent = "Copied";
  setTimeout(() => copyButton.textContent = "Copy result", 1200);
});

codeInput.addEventListener("input", runTool);
exampleButton.addEventListener("click", () => loadExample());
$("#code-clear").addEventListener("click", () => {
  codeInput.value = "";
  runTool();
  codeInput.focus();
});
const copyCodeButton = $("#copy-code");
copyCodeButton.addEventListener("click", async () => {
  await copyText(codeOutput.textContent);
  copyCodeButton.textContent = "Copied";
  setTimeout(() => copyCodeButton.textContent = "Copy result", 1200);
});

const escapeHtml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

if ($("#tool-grid")) $("#tool-grid").innerHTML = [
  ...CATALOG.map(t => `
    <a class="tool-card" href="#/tool/${t.mode}" style="--card-accent: var(--c-${t.mode}); --card-text: var(--t-${t.mode}); --card-ink: var(--i-${t.mode})">
      <span class="tool-card__tab">${t.pair}</span>
      <span class="tool-card__body">
        <strong>${t.title}</strong>
        <span>${escapeHtml(t.text)}</span>
        <em>Open tool <span aria-hidden="true">→</span></em>
      </span>
    </a>`),
  `<div class="tool-card tool-card--soon"><span class="tool-card__body"><strong>More on the way</strong><span>New calculators appear here as soon as they're ready.</span></span></div>`,
].join("");

document.querySelectorAll("[data-coffee]").forEach(link => {
  if (COFFEE_URL) link.href = COFFEE_URL;
  else link.hidden = true;
});

// Hash routes: #/ (home), #/tool/<mode> (home with a tool open), #/tools, #/about.
function route() {
  const [, view = "", param] = location.hash.split("/");
  const name = view === "tools" || view === "about" ? view : "home";
  document.querySelectorAll("[data-view]").forEach(el => el.hidden = el.dataset.view !== name);
  document.querySelectorAll("[data-route]").forEach(link => {
    if (link.dataset.route === name) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title = { home: "CSS Toolkit", tools: "All tools · CSS Toolkit", about: "About · CSS Toolkit" }[name];
  if (view === "tool" && (param in converters || param in tools)) setMode(param);
  window.scrollTo(0, 0);
}


window.addEventListener("hashchange", route);
setMode("rem");
route();
