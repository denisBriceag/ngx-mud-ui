// WCAG contrast for the menu colour pairs, both themes, computed not eyeballed.
// The repo's a11y.test is 'todo' and does not gate; these numbers are the gate.
// Hexes are the RESOLVED values of the semantic tokens used by _menu.scss —
// verify against base/_colors.scss + base/_tokens.scss if a pair fails.

function luminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(c.slice(i, i + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);

  return (hi + 0.05) / (lo + 0.05);
}

interface Pair {
  name: string;
  fg: string;
  bg: string;
  min: number;
}

const LIGHT: Pair[] = [
  { name: 'item text on panel', fg: '#383838', bg: '#FFFFFF', min: 4.5 },
  { name: 'item text on hover', fg: '#383838', bg: '#F5F5F5', min: 4.5 },
  { name: 'item text on active', fg: '#383838', bg: '#D9D9D9', min: 4.5 },
  { name: 'selected brand text on selected bg', fg: '#0058D2', bg: '#F5F5F5', min: 4.5 },
  { name: 'heading text on panel', fg: '#757575', bg: '#FFFFFF', min: 4.5 },
  { name: 'check glyph on selected bg', fg: '#0058D2', bg: '#F5F5F5', min: 3 },
  { name: 'leading icon on panel', fg: '#121212', bg: '#FFFFFF', min: 3 },
  { name: 'focus ring on panel', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
];

const DARK: Pair[] = [
  { name: 'item text on panel', fg: '#F1F1F1', bg: '#1E1E1E', min: 4.5 },
  { name: 'item text on hover', fg: '#F1F1F1', bg: '#2C2C2C', min: 4.5 },
  { name: 'item text on active', fg: '#F1F1F1', bg: '#383838', min: 4.5 },
  { name: 'selected brand text on selected bg', fg: '#669BE4', bg: '#2C2C2C', min: 4.5 },
  { name: 'heading text on panel', fg: '#B2B2B2', bg: '#1E1E1E', min: 4.5 },
  { name: 'check glyph on selected bg', fg: '#669BE4', bg: '#2C2C2C', min: 3 },
  { name: 'leading icon on panel', fg: '#FFFFFF', bg: '#1E1E1E', min: 3 },
  { name: 'focus ring on panel', fg: '#3379DB', bg: '#1E1E1E', min: 3 },
];

describe.each([
  ['light', LIGHT],
  ['dark', DARK],
] as const)('menu contrast (%s)', (_theme, pairs) => {
  it.each(pairs)('$name is at least $min:1', ({ fg, bg, min }) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
