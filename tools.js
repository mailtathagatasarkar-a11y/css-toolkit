import { inlineCss } from "./inline.js";
import { cssToTailwind, formatTailwind } from "./tailwind.js";

const INLINE_EXAMPLE = `<style>
  body { margin: 0; font-family: Arial, sans-serif; }
  .card { padding: 24px; border-radius: 12px; background-color: #f8f3ec; }
  .card h1 { margin: 0 0 8px; font-size: 22px; color: #1c1d21; }
  #cta { display: inline-block; padding: 12px 20px; background: #f4b506; color: #111; text-decoration: none; }
  #cta:hover { background: #ffd801; }
  p { line-height: 1.5; color: #555; }
</style>
<div class="card">
  <h1>Your invoice is ready</h1>
  <p style="color: #333">Thanks for your order. The receipt is attached.</p>
  <a id="cta" href="#">View invoice</a>
</div>`;

const TAILWIND_EXAMPLES = {
  "Flexbox card": `.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1c1d21;
}`,
  "Responsive grid": `.grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
}`,
  "Button with hover": `.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid #1c1d21;
  border-radius: 9999px;
  font-weight: 700;
  cursor: pointer;
}

.button:hover {
  background-color: #1c1d21;
  color: white;
}

.button:focus-visible {
  outline: 2px solid #f4b506;
}`,
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : word.endsWith("s") ? "es" : "s"}`;

export const tools = {
  inline: {
    hint: "Paste HTML with a <style> block. Inline styles appear instantly.",
    inputLabel: "HTML with <style>",
    outputLabel: "Inlined HTML",
    heading: "Inliner options",
    placeholder: "<style> .note { color: #333; } </style>\n<p class=\"note\">Hello</p>",
    options: [
      { key: "removeStyles", label: "Remove inlined <style>", value: true },
      { key: "removeClasses", label: "Strip class attributes", value: false },
    ],
    examples: { Example: INLINE_EXAMPLE },
    run(input, options) {
      const { html, stats } = inlineCss(input, options);
      const kept = stats.kept ? ` · ${plural(stats.kept, "rule")} kept in <style> (hover, media or pseudo)` : "";
      return { output: html, status: `Inlined ${plural(stats.declarations, "declaration")} on ${plural(stats.elements, "element")}${kept}` };
    },
  },
  tailwind: {
    hint: "Paste CSS rules. Tailwind v4 classes appear instantly.",
    inputLabel: "CSS",
    outputLabel: "Tailwind v4 classes",
    heading: "Try an example",
    placeholder: ".card {\n  padding: 16px;\n  border-radius: 8px;\n}",
    options: [],
    examples: TAILWIND_EXAMPLES,
    run(input) {
      const result = cssToTailwind(input);
      const { selectors, declarations, classes, arbitrary } = result.stats;
      const extra = arbitrary ? ` · ${arbitrary} with arbitrary values` : "";
      return { output: formatTailwind(result), status: `${plural(declarations, "declaration")} → ${plural(classes, "class")} across ${plural(selectors, "selector")}${extra}` };
    },
  },
};
