// CSS → Tailwind (v4) utility classes. Pure string processing so it runs (and is tested) in Node.
// Anything without a close utility falls back to Tailwind's arbitrary values/properties, so no
// declaration is silently dropped.

const BREAKPOINTS = { 640: "sm", 768: "md", 1024: "lg", 1280: "xl", 1536: "2xl" };
const PSEUDO_VARIANTS = {
  hover: "hover", focus: "focus", "focus-visible": "focus-visible", "focus-within": "focus-within",
  active: "active", visited: "visited", disabled: "disabled", checked: "checked",
  "first-child": "first", "last-child": "last", "nth-child(odd)": "odd", "nth-child(even)": "even",
  before: "before", after: "after", placeholder: "placeholder",
};
const FONT_SIZES = { 12: "xs", 14: "sm", 16: "base", 18: "lg", 20: "xl", 24: "2xl", 30: "3xl", 36: "4xl", 48: "5xl", 60: "6xl", 72: "7xl", 96: "8xl", 128: "9xl" };
const FONT_WEIGHTS = { 100: "thin", 200: "extralight", 300: "light", 400: "normal", 500: "medium", 600: "semibold", 700: "bold", 800: "extrabold", 900: "black" };
const RADII = { 0: "none", 2: "sm", 4: "", 6: "md", 8: "lg", 12: "xl", 16: "2xl", 24: "3xl" };
const LEADING = { 1: "none", 1.25: "tight", 1.375: "snug", 1.5: "normal", 1.625: "relaxed", 2: "loose" };
const SHADOWS = { none: "none" };
const NAMED_COLORS = { white: "white", "#fff": "white", "#ffffff": "white", black: "black", "#000": "black", "#000000": "black", transparent: "transparent", currentcolor: "current", inherit: "inherit" };
const KEYWORDS = {
  display: { block: "block", "inline-block": "inline-block", inline: "inline", flex: "flex", "inline-flex": "inline-flex", grid: "grid", "inline-grid": "inline-grid", none: "hidden", contents: "contents", table: "table" },
  position: { static: "static", relative: "relative", absolute: "absolute", fixed: "fixed", sticky: "sticky" },
  "flex-direction": { row: "flex-row", "row-reverse": "flex-row-reverse", column: "flex-col", "column-reverse": "flex-col-reverse" },
  "flex-wrap": { wrap: "flex-wrap", nowrap: "flex-nowrap", "wrap-reverse": "flex-wrap-reverse" },
  "justify-content": { "flex-start": "justify-start", start: "justify-start", "flex-end": "justify-end", end: "justify-end", center: "justify-center", "space-between": "justify-between", "space-around": "justify-around", "space-evenly": "justify-evenly", stretch: "justify-stretch" },
  "align-items": { "flex-start": "items-start", start: "items-start", "flex-end": "items-end", end: "items-end", center: "items-center", baseline: "items-baseline", stretch: "items-stretch" },
  "align-self": { auto: "self-auto", "flex-start": "self-start", "flex-end": "self-end", center: "self-center", stretch: "self-stretch", baseline: "self-baseline" },
  "align-content": { center: "content-center", "flex-start": "content-start", "flex-end": "content-end", "space-between": "content-between", "space-around": "content-around" },
  "text-align": { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify", start: "text-start", end: "text-end" },
  "text-transform": { uppercase: "uppercase", lowercase: "lowercase", capitalize: "capitalize", none: "normal-case" },
  "text-decoration": { underline: "underline", "line-through": "line-through", none: "no-underline", overline: "overline" },
  "text-decoration-line": { underline: "underline", "line-through": "line-through", none: "no-underline", overline: "overline" },
  "font-style": { italic: "italic", normal: "not-italic" },
  "white-space": { normal: "whitespace-normal", nowrap: "whitespace-nowrap", pre: "whitespace-pre", "pre-line": "whitespace-pre-line", "pre-wrap": "whitespace-pre-wrap" },
  "box-sizing": { "border-box": "box-border", "content-box": "box-content" },
  "object-fit": { contain: "object-contain", cover: "object-cover", fill: "object-fill", none: "object-none", "scale-down": "object-scale-down" },
  "border-style": { solid: "border-solid", dashed: "border-dashed", dotted: "border-dotted", double: "border-double", none: "border-none" },
  "pointer-events": { none: "pointer-events-none", auto: "pointer-events-auto" },
  "user-select": { none: "select-none", text: "select-text", all: "select-all", auto: "select-auto" },
  visibility: { visible: "visible", hidden: "invisible" },
  "list-style-type": { none: "list-none", disc: "list-disc", decimal: "list-decimal" },
  "word-break": { "break-all": "break-all", "keep-all": "break-keep" },
};
const OVERFLOW = ["auto", "hidden", "visible", "scroll", "clip"];
const CURSORS = ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "grab", "grabbing"];
const SIDES = { top: "t", right: "r", bottom: "b", left: "l" };
const CONTAINERS = { 256: "3xs", 288: "2xs", 320: "xs", 384: "sm", 448: "md", 512: "lg", 576: "xl", 672: "2xl", 768: "3xl", 896: "4xl", 1024: "5xl", 1152: "6xl", 1280: "7xl" };

const arbitrary = value => `[${value.trim().replace(/\s*,\s*/g, ",").replace(/\s+/g, "_")}]`;

function toPx(value) {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] === "rem" || m[2] === "em" ? n * 16 : m[2] === "px" || n === 0 ? n : null;
}

// Tailwind spacing scale: 1 unit = 0.25rem = 4px, with half steps up to 3.5.
function spacing(value) {
  const v = value.trim();
  if (v === "auto") return "auto";
  if (v === "1px") return "px";
  const px = toPx(v);
  if (px !== null) {
    const unit = Math.abs(px) / 4;
    const ok = Number.isInteger(unit) || (unit < 4 && Number.isInteger(unit * 2));
    if (ok) return String(unit);
  }
  return arbitrary(v.replace(/^-/, ""));
}

function withSign(prefix, value) {
  const negative = value.trim().startsWith("-") && value.trim() !== "-0";
  const scale = spacing(value);
  return `${negative ? "-" : ""}${prefix}-${scale}`;
}

function size(prefix, value) {
  const v = value.trim();
  const special = { "100%": "full", auto: "auto", "100vw": "screen", "100vh": "screen", "100dvh": "dvh", "fit-content": "fit", "min-content": "min", "max-content": "max", "50%": "1/2", "33.333333%": "1/3", "66.666667%": "2/3", "25%": "1/4", "75%": "3/4", "20%": "1/5" };
  if (special[v] && !(prefix === "w" && v === "100vh") && !(prefix === "h" && v === "100vw")) return `${prefix}-${special[v]}`;
  return `${prefix}-${spacing(v)}`;
}

function color(prefix, value) {
  const v = value.trim().toLowerCase();
  return `${prefix}-${NAMED_COLORS[v] || arbitrary(value.trim())}`;
}

// Expands 1–4 value box shorthands (padding/margin/inset) to the tightest utilities.
function box(prefix, value) {
  const parts = value.trim().split(/\s+/);
  const [t, r = t, b = t, l = r] = parts;
  const make = (p, v) => (prefix === "m" ? withSign(p, v) : `${p}-${spacing(v)}`);
  if (t === r && r === b && b === l) return [make(prefix, t)];
  if (t === b && r === l) return [make(`${prefix}y`, t), make(`${prefix}x`, r)];
  if (r === l) return [make(`${prefix}t`, t), make(`${prefix}x`, r), make(`${prefix}b`, b)];
  if (t === b) return [make(`${prefix}y`, t), make(`${prefix}r`, r), make(`${prefix}l`, l)];
  return [make(`${prefix}t`, t), make(`${prefix}r`, r), make(`${prefix}b`, b), make(`${prefix}l`, l)];
}

function roundedClass(side, value) {
  const v = value.trim();
  const px = toPx(v);
  const size = v === "50%" || /^\d{3,}px$/.test(v) ? "full" : px !== null && px in RADII ? RADII[px] : arbitrary(v);
  return size ? `rounded${side}-${size}` : `rounded${side}`;
}

// 1–4 value radii (tl tr br bl) become the fewest side or corner utilities; zero corners are omitted.
function radius(value) {
  const v = value.trim();
  if (v.includes("/")) return [`rounded-${arbitrary(v)}`];
  const [a, b = a, c = a, d = b] = v.split(/\s+(?![^(]*\))/);
  const corners = { tl: a, tr: b, br: c, bl: d };
  const pick = (side, val) => (toPx(val) === 0 ? [] : [roundedClass(side, val)]);
  if (a === b && b === c && c === d) return [roundedClass("", a)];
  if (a === b && c === d) return [...pick("-t", a), ...pick("-b", c)];
  if (a === d && b === c) return [...pick("-l", a), ...pick("-r", b)];
  const values = Object.values(corners);
  const common = values.find(x => values.filter(y => y === x).length === 3);
  if (common) {
    const [corner, odd] = Object.entries(corners).find(([, x]) => x !== common);
    return [roundedClass("", common), roundedClass(`-${corner}`, odd)];
  }
  return Object.entries(corners).flatMap(([corner, val]) => pick(`-${corner}`, val));
}

function border(value) {
  const out = [];
  for (const part of value.trim().split(/\s+(?![^(]*\))/)) {
    const px = toPx(part);
    if (px !== null) out.push(px === 1 ? "border" : [0, 2, 4, 8].includes(px) ? `border-${px}` : `border-${arbitrary(part)}`);
    else if (part === "solid") continue; // Tailwind's reset already makes borders solid.
    else if (KEYWORDS["border-style"][part]) out.push(KEYWORDS["border-style"][part]);
    else out.push(color("border", part));
  }
  return out;
}

export function declarationToClasses(prop, rawValue) {
  const value = rawValue.trim();
  const v = value.toLowerCase();
  if (KEYWORDS[prop]?.[v]) return [KEYWORDS[prop][v]];

  switch (prop) {
    case "padding": return box("p", value);
    case "margin": return box("m", value);
    case "padding-top": case "padding-right": case "padding-bottom": case "padding-left":
      return [`p${SIDES[prop.slice(8)]}-${spacing(value)}`];
    case "margin-top": case "margin-right": case "margin-bottom": case "margin-left":
      return [withSign(`m${SIDES[prop.slice(7)]}`, value)];
    case "padding-inline": return [`px-${spacing(value)}`];
    case "padding-block": return [`py-${spacing(value)}`];
    case "margin-inline": return [withSign("mx", value)];
    case "margin-block": return [withSign("my", value)];
    case "gap": {
      const [row, col] = value.split(/\s+/);
      return col && col !== row ? [`gap-y-${spacing(row)}`, `gap-x-${spacing(col)}`] : [`gap-${spacing(row)}`];
    }
    case "row-gap": return [`gap-y-${spacing(value)}`];
    case "column-gap": return [`gap-x-${spacing(value)}`];
    case "width": return [size("w", value)];
    case "height": return [size("h", value)];
    case "min-width": return [size("min-w", value)];
    case "min-height": return [size("min-h", value)];
    case "max-width": {
      const px = toPx(value);
      return [v === "none" ? "max-w-none" : px !== null && CONTAINERS[px] ? `max-w-${CONTAINERS[px]}` : size("max-w", value)];
    }
    case "outline": {
      if (v === "none" || v === "0") return ["outline-hidden"];
      return v.split(/\s+(?![^(]*\))/).map(part => {
        const px = toPx(part);
        if (px !== null) return px === 1 ? "outline" : `outline-${Number.isInteger(px) ? px : arbitrary(part)}`;
        if (["solid", "dashed", "dotted", "double"].includes(part)) return `outline-${part}`;
        return color("outline", part);
      });
    }
    case "outline-offset": { const px = toPx(value); return [px !== null && Number.isInteger(px) ? `outline-offset-${px}` : `outline-offset-${arbitrary(value)}`]; }
    case "max-height": return [v === "none" ? "max-h-none" : size("max-h", value)];
    case "top": case "right": case "bottom": case "left": return [withSign(prop, value)];
    case "inset": return value.trim().split(/\s+/).length === 1 ? [withSign("inset", value)] : [`inset-${arbitrary(value)}`];
    case "z-index": return [/^(0|10|20|30|40|50|auto)$/.test(v) ? `z-${v}` : `z-${arbitrary(value)}`];
    case "opacity": {
      const pct = Math.round(Number(v) * 100);
      return [Number.isFinite(pct) && pct % 5 === 0 ? `opacity-${pct}` : `opacity-${arbitrary(value)}`];
    }
    case "overflow": case "overflow-x": case "overflow-y":
      return [OVERFLOW.includes(v) ? `${prop}-${v}` : `[${prop}:${value}]`];
    case "cursor": return [CURSORS.includes(v) ? `cursor-${v}` : `cursor-${arbitrary(value)}`];
    case "color": return [color("text", value)];
    case "background-color": return [color("bg", value)];
    case "background":
      return /^(#|rgb|hsl|[a-z]+$)/i.test(v) ? [color("bg", value)] : [`bg-${arbitrary(value)}`];
    case "border-color": return [color("border", value)];
    case "border": return v === "none" || v === "0" ? ["border-0"] : border(value);
    case "border-width": { const px = toPx(value); return [px === 1 ? "border" : [0, 2, 4, 8].includes(px) ? `border-${px}` : `border-${arbitrary(value)}`]; }
    case "border-top": case "border-right": case "border-bottom": case "border-left": {
      const side = SIDES[prop.slice(7)];
      return border(value).map(c => c === "border" ? `border-${side}` : c.replace(/^border-(\d)/, `border-${side}-$1`).replace(/^border-(\[\d)/, `border-${side}-$1`));
    }
    case "border-radius": return radius(value);
    case "font-size": { const px = toPx(value); return [px !== null && FONT_SIZES[px] ? `text-${FONT_SIZES[px]}` : `text-${arbitrary(value)}`]; }
    case "font-weight": return [FONT_WEIGHTS[v] ? `font-${FONT_WEIGHTS[v]}` : v === "bold" ? "font-bold" : v === "normal" ? "font-normal" : `font-${arbitrary(value)}`];
    case "font-family": return [`font-${arbitrary(value.replace(/["']/g, "'"))}`];
    case "line-height": return [LEADING[v] ? `leading-${LEADING[v]}` : `leading-${arbitrary(value)}`];
    case "letter-spacing": return [`tracking-${arbitrary(value)}`];
    case "box-shadow": return [SHADOWS[v] ? `shadow-${SHADOWS[v]}` : `shadow-${arbitrary(value)}`];
    case "flex": {
      const map = { "1": "flex-1", "1 1 0%": "flex-1", "1 1 auto": "flex-auto", auto: "flex-auto", "0 1 auto": "flex-initial", initial: "flex-initial", none: "flex-none" };
      return [map[v] || `flex-${arbitrary(value)}`];
    }
    case "flex-grow": return [v === "1" ? "grow" : v === "0" ? "grow-0" : `grow-${arbitrary(value)}`];
    case "flex-shrink": return [v === "1" ? "shrink" : v === "0" ? "shrink-0" : `shrink-${arbitrary(value)}`];
    case "grid-template-columns": case "grid-template-rows": {
      const p = prop.endsWith("columns") ? "grid-cols" : "grid-rows";
      const m = /^repeat\((\d+),\s*(1fr|minmax\(0,\s*1fr\))\)$/.exec(v);
      return [m ? `${p}-${m[1]}` : v === "none" ? `${p}-none` : `${p}-${arbitrary(value)}`];
    }
    case "grid-column": case "grid-row": {
      const p = prop === "grid-column" ? "col" : "row";
      const m = /^span\s+(\d+)(\s*\/\s*span\s+\1)?$/.exec(v);
      return [m ? `${p}-span-${m[1]}` : v === "1 / -1" ? `${p}-span-full` : `${p}-${arbitrary(value)}`];
    }
    case "transition": return [v === "none" ? "transition-none" : `transition-${arbitrary(value)}`];
    case "transform": return [v === "none" ? "transform-none" : `transform-${arbitrary(value)}`];
    case "aspect-ratio": return [v === "1 / 1" || v === "1" ? "aspect-square" : v === "16 / 9" ? "aspect-video" : `aspect-${arbitrary(value)}`];
    default: return [`[${prop}:${value.replace(/\s+/g, "_")}]`];
  }
}

// Splits a declaration block on semicolons that are not inside parentheses or quotes (data URIs).
export function splitDeclarations(body) {
  const out = [];
  let depth = 0, quote = null, current = "";
  for (const ch of body) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === ";" && depth === 0) { out.push(current); current = ""; continue; }
    current += ch;
  }
  out.push(current);
  return out;
}

// Minimal CSS parser: style rules (with their @media context, if any) plus other at-rules kept
// verbatim as { raw }. Declarations keep the author's original text. Comments are stripped.
export function parseCss(css) {
  const rules = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;
  const readBlock = start => {
    let depth = 0;
    for (let j = start; j < text.length; j++) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}" && --depth === 0) return j;
    }
    return text.length;
  };
  const parseDeclarations = body => splitDeclarations(body).map(d => d.trim()).filter(Boolean).map(d => {
    const idx = d.indexOf(":");
    const important = /!important\s*$/i.test(d);
    return { prop: d.slice(0, idx).trim().toLowerCase(), value: d.slice(idx + 1).replace(/!important\s*$/i, "").trim(), important };
  }).filter(d => d.prop && d.value);
  const walk = (from, to, media) => {
    i = from;
    while (i < to) {
      const open = text.indexOf("{", i);
      const semi = text.indexOf(";", i);
      const start = text.slice(i, to).search(/\S/);
      if (start === -1) break;
      // Block-less at-rules such as @import or @charset.
      if (text[i + start] === "@" && semi !== -1 && semi < to && (open === -1 || semi < open)) {
        rules.push({ raw: text.slice(i + start, semi + 1) });
        i = semi + 1;
        continue;
      }
      if (open === -1 || open >= to) break;
      const prelude = text.slice(i, open).trim();
      const close = readBlock(open);
      if (prelude.startsWith("@media")) {
        const saved = close + 1;
        walk(open + 1, close, prelude.slice(6).trim());
        i = saved;
        continue;
      }
      if (prelude.startsWith("@")) rules.push({ raw: text.slice(text.lastIndexOf("@", open), close + 1).trim(), media });
      else if (prelude) rules.push({ selector: prelude, media, declarations: parseDeclarations(text.slice(open + 1, close)) });
      i = close + 1;
    }
  };
  walk(0, text.length, null);
  return rules;
}

function mediaVariant(media) {
  if (!media) return "";
  if (/prefers-color-scheme:\s*dark/i.test(media)) return "dark:";
  const min = /min-width:\s*(\d+)px/i.exec(media);
  if (min) return `${BREAKPOINTS[min[1]] || `min-[${min[1]}px]`}:`;
  const max = /max-width:\s*(\d+(?:\.\d+)?)px/i.exec(media);
  if (max) {
    const bp = BREAKPOINTS[Math.round(Number(max[1]))] || BREAKPOINTS[Math.round(Number(max[1])) + 1];
    return bp ? `max-${bp}:` : `max-[${max[1]}px]:`;
  }
  return `[@media${arbitrary(media).slice(1, -1).replace(/^/, "_")}]:`;
}

// Splits ".btn:hover" into the base selector and its Tailwind variant prefix.
function selectorVariant(selector) {
  let base = selector, variants = "";
  base = base.replace(/::?([\w-]+(?:\([^)]*\))?)$/g, (match, pseudo) => {
    const variant = PSEUDO_VARIANTS[pseudo.toLowerCase()];
    if (!variant) return match;
    variants = `${variant}:${variants}`;
    return "";
  });
  if (base !== selector && /::?[\w-]+(\([^)]*\))?$/.test(base)) {
    const again = selectorVariant(base);
    return { base: again.base, variants: again.variants + variants };
  }
  return { base: base.trim(), variants };
}

export function cssToTailwind(css) {
  const groups = new Map(); // base selector -> ordered class list
  let declarations = 0, arbitraryCount = 0;
  for (const rule of parseCss(css)) {
    if (!rule.selector) continue;
    const prefix = mediaVariant(rule.media);
    for (const selector of rule.selector.split(",").map(s => s.trim()).filter(Boolean)) {
      const { base, variants } = selectorVariant(selector);
      const list = groups.get(base) || [];
      for (const d of rule.declarations) {
        declarations++;
        for (const cls of declarationToClasses(d.prop, d.value)) {
          if (cls.includes("[")) arbitraryCount++;
          const full = `${prefix}${variants}${d.important ? "!" : ""}${cls}`;
          const i = list.indexOf(full);
          if (i !== -1) list.splice(i, 1);
          list.push(full);
        }
      }
      groups.set(base, list);
    }
  }
  const classes = [...groups.values()].reduce((n, l) => n + l.length, 0);
  return {
    groups: [...groups].map(([selector, list]) => ({ selector, classes: list.join(" ") })),
    stats: { selectors: groups.size, declarations, classes, arbitrary: arbitraryCount },
  };
}

export function formatTailwind(result) {
  return result.groups.map(g => `/* ${g.selector} */\n${g.classes}`).join("\n\n");
}
