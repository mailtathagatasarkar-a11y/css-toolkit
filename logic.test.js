import test from "node:test";
import assert from "node:assert/strict";
import { convert, describe } from "./logic.js";

const settings = { root: 16, parent: 20, viewportWidth: 1440, viewportHeight: 900 };

test("converts pixels and rem in both directions", () => {
  assert.equal(convert("rem", "toRight", 24, settings), 1.5);
  assert.equal(convert("rem", "toLeft", 1.5, settings), 24);
});

test("converts rem and em using root and parent font sizes", () => {
  assert.equal(convert("em", "toRight", 1, settings), 0.8);
  assert.equal(convert("em", "toLeft", 0.8, settings), 1);
});

test("converts pixels and viewport units in both directions", () => {
  assert.equal(convert("vw", "toRight", 72, settings), 5);
  assert.equal(convert("vw", "toLeft", 5, settings), 72);
  assert.equal(convert("vh", "toRight", 45, settings), 5);
  assert.equal(convert("vh", "toLeft", 5, settings), 45);
});

test("rounds to the requested number of decimal places", () => {
  assert.equal(convert("vw", "toRight", 16, { ...settings, decimals: 2 }), 1.11);
  assert.equal(convert("vw", "toRight", 16, { ...settings, decimals: 0 }), 1);
  assert.equal(convert("vw", "toRight", 16, settings), 1.1111);
});

test("describes the formula and worked example for each direction", () => {
  assert.deepEqual(describe("rem", "toRight", "24", "1.500", settings), {
    expression: "rem = px ÷ root font size",
    worked: "24px ÷ 16px = 1.500rem",
  });
  assert.deepEqual(describe("vw", "toLeft", "5", "72.000", settings), {
    expression: "px = vw × viewport width ÷ 100",
    worked: "5vw × 1440px ÷ 100 = 72.000px",
  });
  assert.equal(describe("em", "toRight", "1", "0.800", settings).worked, "1rem × 16px ÷ 20px = 0.800em");
});
