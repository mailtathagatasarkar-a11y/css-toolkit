export const DEFAULT_DECIMALS = 4;

const round = (value, precision = DEFAULT_DECIMALS) => {
  if (!Number.isFinite(value)) return 0;
  return Number(value.toFixed(precision));
};

export const converters = {
  rem: {
    leftUnit: "px",
    rightUnit: "rem",
    leftLabel: "Pixels",
    rightLabel: "REM",
    defaultLeft: 16,
    toRight: (px, settings) => round(px / settings.root, settings.decimals),
    toLeft: (rem, settings) => round(rem * settings.root, settings.decimals),
  },
  em: {
    leftUnit: "rem",
    rightUnit: "em",
    leftLabel: "REM",
    rightLabel: "EM",
    defaultLeft: 1,
    toRight: (rem, settings) => round((rem * settings.root) / settings.parent, settings.decimals),
    toLeft: (em, settings) => round((em * settings.parent) / settings.root, settings.decimals),
  },
  vw: {
    leftUnit: "px",
    rightUnit: "vw",
    leftLabel: "Pixels",
    rightLabel: "Viewport width",
    defaultLeft: 16,
    toRight: (px, settings) => round((px / settings.viewportWidth) * 100, settings.decimals),
    toLeft: (vw, settings) => round((vw / 100) * settings.viewportWidth, settings.decimals),
  },
  vh: {
    leftUnit: "px",
    rightUnit: "vh",
    leftLabel: "Pixels",
    rightLabel: "Viewport height",
    defaultLeft: 16,
    toRight: (px, settings) => round((px / settings.viewportHeight) * 100, settings.decimals),
    toLeft: (vh, settings) => round((vh / 100) * settings.viewportHeight, settings.decimals),
  },
};

export function convert(mode, direction, rawValue, settings) {
  const value = Number(rawValue);
  const converter = converters[mode];
  if (!converter || !Number.isFinite(value)) return 0;
  return direction === "toLeft"
    ? converter.toLeft(value, settings)
    : converter.toRight(value, settings);
}

export const VIEWPORT_PRESETS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 375, height: 667 },
];

// Formula text and a worked example for the direction the user last edited.
const formulas = {
  rem: {
    toRight: s => ["rem = px ÷ root font size", v => `${v}px ÷ ${s.root}px`],
    toLeft: s => ["px = rem × root font size", v => `${v}rem × ${s.root}px`],
  },
  em: {
    toRight: s => ["em = rem × root font size ÷ parent font size", v => `${v}rem × ${s.root}px ÷ ${s.parent}px`],
    toLeft: s => ["rem = em × parent font size ÷ root font size", v => `${v}em × ${s.parent}px ÷ ${s.root}px`],
  },
  vw: {
    toRight: s => ["vw = px ÷ viewport width × 100", v => `${v}px ÷ ${s.viewportWidth}px × 100`],
    toLeft: s => ["px = vw × viewport width ÷ 100", v => `${v}vw × ${s.viewportWidth}px ÷ 100`],
  },
  vh: {
    toRight: s => ["vh = px ÷ viewport height × 100", v => `${v}px ÷ ${s.viewportHeight}px × 100`],
    toLeft: s => ["px = vh × viewport height ÷ 100", v => `${v}vh × ${s.viewportHeight}px ÷ 100`],
  },
};

export function describe(mode, direction, rawValue, resultText, settings) {
  const converter = converters[mode];
  const [expression, steps] = formulas[mode][direction === "toLeft" ? "toLeft" : "toRight"](settings);
  const value = Number(rawValue) || 0;
  const unit = direction === "toLeft" ? converter.leftUnit : converter.rightUnit;
  return { expression, worked: `${steps(value)} = ${resultText}${unit}` };
}
