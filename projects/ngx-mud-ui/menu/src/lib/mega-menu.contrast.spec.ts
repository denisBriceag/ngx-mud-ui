// WCAG contrast for the mega-menu colour pairs, both themes, computed not eyeballed.
// Hexes are the RESOLVED values of the semantic tokens used by _mega-menu.scss —
// verify against base/_tokens.scss, base/_colors.scss and themes/_dark.scss if a pair fails.
// Top-level names are mega-prefixed: the sibling menu.contrast.spec.ts is a script file, so they share one scope.

function megaLuminance(hex: string): number {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(c.slice(i, i + 2), 16) / 255;

    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function megaRatio(fg: string, bg: string): number {
  const [hi, lo] = [megaLuminance(fg), megaLuminance(bg)].sort((a, b) => b - a);

  return (hi + 0.05) / (lo + 0.05);
}

interface MegaPair {
  name: string;
  fg: string;
  bg: string;
  min: number;
}

const MEGA_LIGHT: MegaPair[] = [
  { name: 'trigger text on bar', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'trigger text on hover', fg: '#121212', bg: '#F5F5F5', min: 4.5 },
  { name: 'open trigger brand text on bar', fg: '#0058D2', bg: '#FFFFFF', min: 4.5 },
  { name: 'open trigger underline on bar', fg: '#0058D2', bg: '#FFFFFF', min: 3 },
  { name: 'heading on panel', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'link on panel', fg: '#383838', bg: '#FFFFFF', min: 4.5 },
  { name: 'link hover on panel', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  // Trigger ring is --mud-focus-ring-outer-color; the link ring is --mud-color-border-brand-default (a different value in light).
  { name: 'trigger focus ring on bar', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
  { name: 'link focus ring on panel', fg: '#0058D2', bg: '#FFFFFF', min: 3 },
];

const MEGA_DARK: MegaPair[] = [
  { name: 'trigger text on bar', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'trigger text on hover', fg: '#FFFFFF', bg: '#2C2C2C', min: 4.5 },
  { name: 'open trigger brand text on bar', fg: '#669BE4', bg: '#1E1E1E', min: 4.5 },
  { name: 'open trigger underline on bar', fg: '#3379DB', bg: '#1E1E1E', min: 3 },
  { name: 'heading on panel', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'link on panel', fg: '#F1F1F1', bg: '#1E1E1E', min: 4.5 },
  { name: 'link hover on panel', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'trigger focus ring on bar', fg: '#3379DB', bg: '#1E1E1E', min: 3 },
  { name: 'link focus ring on panel', fg: '#3379DB', bg: '#1E1E1E', min: 3 },
];

describe.each([
  ['light', MEGA_LIGHT],
  ['dark', MEGA_DARK],
] as const)('mega-menu contrast (%s)', (_theme, pairs) => {
  it.each(pairs)('$name is at least $min:1', ({ fg, bg, min }) => {
    expect(megaRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
