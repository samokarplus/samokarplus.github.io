import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_THEME, normalizeTheme, foreground } from "../src/theme.js";
test("theme accepts hex colors only and fills missing or invalid colors", () => {
  assert.deepEqual(
    normalizeTheme({ background: "#ABCDEF", table: "url(bad)" }),
    { background: "#abcdef", table: DEFAULT_THEME.table },
  );
  assert.deepEqual(normalizeTheme(null), DEFAULT_THEME);
});
test("text contrast adapts to light and dark custom colors", () => {
  assert.equal(foreground("#ffffff"), "#202b27");
  assert.equal(foreground("#000000"), "#ffffff");
  assert.equal(foreground(DEFAULT_THEME.table), "#ffffff");
});
