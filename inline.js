// CSS → inline style converter. Pure selector helpers are exported for tests;
// inlineCss() needs a browser DOM (DOMParser) to match selectors.

import { parseCss, splitDeclarations } from "./tailwind.js";

// Selectors that can never match a static email render stay in a <style> block.
const DYNAMIC = /::?(hover|focus|focus-visible|focus-within|active|visited|link|target|checked|disabled|enabled|before|after|first-line|first-letter|placeholder|selection|marker)\b/i;

export function splitSelectors(text) {
  const parts = [];
  let depth = 0, quote = null, current = "";
  for (const ch of text) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "," && depth === 0) { parts.push(current.trim()); current = ""; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export function isStaticSelector(selector) {
  return !DYNAMIC.test(selector);
}

// Returns [ids, classes/attributes/pseudo-classes, elements/pseudo-elements].
export function specificity(selector) {
  let ids = 0, classes = 0, elements = 0;
  let s = selector.replace(/"[^"]*"|'[^']*'/g, "");
  // :where() adds nothing; :is()/:not()/:has() take their most specific argument.
  s = s.replace(/:where\((?:[^()]|\([^()]*\))*\)/gi, "");
  s = s.replace(/:(is|not|has)\(((?:[^()]|\([^()]*\))*)\)/gi, (_, __, inner) => {
    const best = splitSelectors(inner).map(specificity).sort(compareSpecificity).pop() || [0, 0, 0];
    ids += best[0]; classes += best[1]; elements += best[2];
    return "";
  });
  s = s.replace(/\[[^\]]*\]/g, () => { classes++; return ""; });
  s = s.replace(/::[\w-]+(\([^)]*\))?/g, () => { elements++; return ""; });
  s = s.replace(/#[\w-]+/g, () => { ids++; return ""; });
  s = s.replace(/\.[\w-]+/g, () => { classes++; return ""; });
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => { classes++; return ""; });
  elements += (s.match(/(^|[\s>+~])([a-z][\w-]*)/gi) || []).length;
  return [ids, classes, elements];
}

export function compareSpecificity(a, b) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

const serialize = decls => decls.map(d => `${d.prop}: ${d.value}${d.important ? " !important" : ""}`).join("; ");

// Orders declarations by cascade precedence (lowest first) and keeps only the winning
// occurrence of each property, so the author's shorthands and values survive untouched.
export function resolveCascade(decls) {
  const sorted = [...decls].sort((a, b) => (a.important - b.important) || compareSpecificity(a.spec, b.spec) || a.order - b.order);
  const winners = new Map();
  for (const d of sorted) { winners.delete(d.prop); winners.set(d.prop, d); }
  return [...winners.values()];
}

export function inlineCss(html, { removeStyles = true, removeClasses = false } = {}) {
  const isDocument = /<html[\s>]/i.test(html);
  const doctype = (html.match(/<!doctype[^>]*>/i) || [""])[0];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const matches = new Map(); // element -> declarations
  const kept = [];
  let order = 0;
  // A fragment has no <html>/<body> in the output, so rules aimed at them stay in <style>.
  const unreachable = el => !isDocument && (el === doc.body || el === doc.documentElement);

  for (const styleEl of [...doc.querySelectorAll("style")]) {
    for (const rule of parseCss(styleEl.textContent)) {
      if (!rule.selector) { kept.push(rule.media ? `@media ${rule.media} { ${rule.raw} }` : rule.raw); continue; }
      const block = `{ ${serialize(rule.declarations)} }`;
      if (rule.media) { kept.push(`@media ${rule.media} { ${rule.selector} ${block} }`); continue; }
      const leftovers = [];
      for (const selector of splitSelectors(rule.selector)) {
        let elements = null;
        try { if (isStaticSelector(selector)) elements = [...doc.querySelectorAll(selector)]; } catch { /* invalid selector: keep it */ }
        if (!elements || elements.some(unreachable)) { leftovers.push(selector); continue; }
        const spec = specificity(selector);
        for (const el of elements) {
          const list = matches.get(el) || [];
          for (const d of rule.declarations) list.push({ ...d, spec, order: order++ });
          matches.set(el, list);
        }
      }
      if (leftovers.length) kept.push(`${leftovers.join(", ")} ${block}`);
    }
    if (removeStyles) styleEl.remove();
  }

  let declarations = 0;
  for (const [el, list] of matches) {
    // Existing inline styles beat stylesheet rules unless those are !important.
    for (const raw of splitDeclarations(el.getAttribute("style") || "")) {
      const idx = raw.indexOf(":");
      if (idx < 1) continue;
      const important = /!important\s*$/i.test(raw);
      list.push({ prop: raw.slice(0, idx).trim().toLowerCase(), value: raw.slice(idx + 1).replace(/!important\s*$/i, "").trim(), important, spec: [Infinity, 0, 0], order: order++ });
    }
    const resolved = resolveCascade(list);
    el.setAttribute("style", serialize(resolved));
    declarations += resolved.length;
  }

  if (removeClasses) doc.querySelectorAll("[class]").forEach(el => el.removeAttribute("class"));
  if (removeStyles && kept.length) {
    const style = doc.createElement("style");
    style.textContent = `\n  ${kept.join("\n  ")}\n`;
    doc.head.appendChild(style);
  }

  const headStyles = [...doc.head.querySelectorAll("style")].map(s => s.outerHTML).join("\n");
  const output = isDocument
    ? `${doctype ? `${doctype}\n` : ""}${doc.documentElement.outerHTML}`
    : `${headStyles}${headStyles ? "\n" : ""}${doc.body.innerHTML}`;
  return { html: output.trim(), stats: { elements: matches.size, declarations, kept: kept.length } };
}
