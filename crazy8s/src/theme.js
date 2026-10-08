export const DEFAULT_THEME = { background: "#f5f8f6", table: "#216751" };
export const PALETTES = {
  background: [
    ["Pearl", "#f5f8f6"],
    ["Rose", "#f7e5ec"],
    ["Sky", "#e4edf8"],
    ["Charcoal", "#25282d"],
  ],
  table: [
    ["Forest", "#216751"],
    ["Ocean", "#245b80"],
    ["Berry", "#7e3557"],
    ["Ivory", "#eee7d6"],
  ],
};
export function normalizeTheme(value = {}) {
  return Object.fromEntries(
    Object.keys(DEFAULT_THEME).map((key) => [
      key,
      typeof value?.[key] === "string" && /^#[0-9a-f]{6}$/i.test(value[key])
        ? value[key].toLowerCase()
        : DEFAULT_THEME[key],
    ]),
  );
}
export function foreground(color) {
  const channels = color
    .slice(1)
    .match(/../g)
    .map((hex) => {
      const value = parseInt(hex, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 >
    0.179
    ? "#202b27"
    : "#ffffff";
}
