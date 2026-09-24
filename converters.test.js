import test from "node:test";
import assert from "node:assert/strict";
import { cssToTailwind, declarationToClasses, parseCss } from "./tailwind.js";
import { specificity, splitSelectors, isStaticSelector, resolveCascade } from "./inline.js";

test("maps spacing, sizing and keywords to the Tailwind scale", () => {
  assert.deepEqual(declarationToClasses("padding", "16px"), ["p-4"]);
  assert.deepEqual(declarationToClasses("padding", "8px 16px"), ["py-2", "px-4"]);
  assert.deepEqual(declarationToClasses("margin", "0 auto"), ["my-0", "mx-auto"]);
  assert.deepEqual(declarationToClasses("margin-top", "-8px"), ["-mt-2"]);
  assert.deepEqual(declarationToClasses("gap", "1.5rem"), ["gap-6"]);
  assert.deepEqual(declarationToClasses("width", "100%"), ["w-full"]);
  assert.deepEqual(declarationToClasses("max-width", "1280px"), ["max-w-7xl"]);
  assert.deepEqual(declarationToClasses("outline", "2px solid #f4b506"), ["outline-2", "outline-solid", "outline-[#f4b506]"]);
  assert.deepEqual(declarationToClasses("border", "2px dashed red"), ["border-2", "border-dashed", "border-[red]"]);
  assert.deepEqual(declarationToClasses("display", "none"), ["hidden"]);
  assert.deepEqual(declarationToClasses("justify-content", "space-between"), ["justify-between"]);
});

test("falls back to arbitrary values instead of dropping declarations", () => {
  assert.deepEqual(declarationToClasses("padding", "13px"), ["p-[13px]"]);
  assert.deepEqual(declarationToClasses("color", "#3b82f6"), ["text-[#3b82f6]"]);
  assert.deepEqual(declarationToClasses("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)"), ["shadow-[0_4px_6px_rgba(0,0,0,0.1)]"]);
  assert.deepEqual(declarationToClasses("mix-blend-mode", "multiply"), ["[mix-blend-mode:multiply]"]);
});

test("maps type, borders and radii", () => {
  assert.deepEqual(declarationToClasses("font-size", "1.125rem"), ["text-lg"]);
  assert.deepEqual(declarationToClasses("font-weight", "600"), ["font-semibold"]);
  assert.deepEqual(declarationToClasses("line-height", "1.5"), ["leading-normal"]);
  assert.deepEqual(declarationToClasses("border", "1px solid #e5e7eb"), ["border", "border-[#e5e7eb]"]);
  assert.deepEqual(declarationToClasses("border-radius", "8px"), ["rounded-lg"]);
  assert.deepEqual(declarationToClasses("border-radius", "50%"), ["rounded-full"]);
  assert.deepEqual(declarationToClasses("grid-template-columns", "repeat(3, 1fr)"), ["grid-cols-3"]);
});

test("turns pseudo-classes and media queries into variants grouped by selector", () => {
  const css = `
    .btn { padding: 8px 16px; background-color: #2563eb; color: white; }
    .btn:hover { background-color: #1d4ed8; }
    @media (min-width: 768px) { .btn { padding: 12px 24px; } }
    .title, .subtitle { font-weight: 700 !important; }`;
  const { groups, stats } = cssToTailwind(css);
  assert.deepEqual(groups, [
    { selector: ".btn", classes: "py-2 px-4 bg-[#2563eb] text-white hover:bg-[#1d4ed8] md:py-3 md:px-6" },
    { selector: ".title", classes: "!font-bold" },
    { selector: ".subtitle", classes: "!font-bold" },
  ]);
  assert.equal(stats.selectors, 3);
});

test("parses rules, strips comments and keeps media context", () => {
  const rules = parseCss("/* x */ a { color: red } @media (max-width: 640px) { a { color: blue } }");
  assert.equal(rules.length, 2);
  assert.equal(rules[1].media, "(max-width: 640px)");
});

test("computes selector specificity for the inliner cascade", () => {
  assert.deepEqual(specificity("p"), [0, 0, 1]);
  assert.deepEqual(specificity(".card p"), [0, 1, 1]);
  assert.deepEqual(specificity("#main .card > a:first-child"), [1, 2, 1]);
  assert.deepEqual(specificity("a[href^='http']"), [0, 1, 1]);
  assert.deepEqual(specificity(":where(.x) p"), [0, 0, 1]);
  assert.deepEqual(specificity("li:not(.active, #x)"), [1, 0, 1]);
});

test("splits selector lists and flags selectors that need a live browser", () => {
  assert.deepEqual(splitSelectors("h1, .a:is(.b, .c), [data-x='1,2']"), ["h1", ".a:is(.b, .c)", "[data-x='1,2']"]);
  assert.equal(isStaticSelector(".btn"), true);
  assert.equal(isStaticSelector(".btn:hover"), false);
  assert.equal(isStaticSelector("p::before"), false);
});

test("resolves the cascade by importance, specificity, then source order", () => {
  const decls = [
    { prop: "color", value: "#555", important: false, spec: [0, 0, 1], order: 0 },
    { prop: "color", value: "#333", important: false, spec: [Infinity, 0, 0], order: 3 },
    { prop: "padding", value: "24px", important: false, spec: [0, 1, 0], order: 1 },
    { prop: "background", value: "#f4b506", important: true, spec: [0, 0, 1], order: 2 },
    { prop: "background", value: "#000", important: false, spec: [1, 0, 0], order: 4 },
  ];
  assert.deepEqual(resolveCascade(decls).map(d => `${d.prop}:${d.value}`), ["padding:24px", "color:#333", "background:#f4b506"]);
});

test("uses the fewest classes for real Figma padding and radius values", () => {
  assert.deepEqual(declarationToClasses("padding", "28px 32px 24px 32px"), ["pt-7", "px-8", "pb-6"]);
  assert.deepEqual(declarationToClasses("padding", "12px 20px 12px 16px"), ["py-3", "pr-5", "pl-4"]);
  assert.deepEqual(declarationToClasses("border-radius", "16px 16px 0 0"), ["rounded-t-2xl"]);
  assert.deepEqual(declarationToClasses("border-radius", "0 16px 16px 16px"), ["rounded-2xl", "rounded-tl-none"]);
  assert.deepEqual(declarationToClasses("border-radius", "8px 0 0 8px"), ["rounded-l-lg"]);
  assert.deepEqual(declarationToClasses("border-radius", "4px 8px 12px 16px"), ["rounded-tl", "rounded-tr-lg", "rounded-br-xl", "rounded-bl-2xl"]);
  assert.deepEqual(declarationToClasses("border-radius", "999px"), ["rounded-full"]);
});

test("keeps Figma variables as var() with a fallback value", () => {
  assert.deepEqual(declarationToClasses("background", "var(--color-accent-yellow, #F4B506)"), ["bg-[var(--color-accent-yellow,#F4B506)]"]);
  assert.deepEqual(declarationToClasses("border", "1px solid var(--color-bg-tab, #131313)"), ["border", "border-[var(--color-bg-tab,#131313)]"]);
  assert.deepEqual(declarationToClasses("border-radius", "var(--radius-sm, 8px)"), ["rounded-[var(--radius-sm,8px)]"]);
});
