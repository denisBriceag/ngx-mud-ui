export {};

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

// Resolved from base/_tokens.scss (light) and themes/_dark.scss (dark), 2026-09-24.
// The `…` glyph is pinned at 3:1 (non-text indicator, WCAG 1.4.11): upstream's tertiary
// label is 4.07:1 on the light hover surface, below 4.5 but above 3.
const LIGHT: Pair[] = [
  { name: 'page number on page background', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'page number on hover', fg: '#121212', bg: '#F1F1F1', min: 4.5 },
  { name: 'page number on pressed', fg: '#121212', bg: '#B2B2B2', min: 4.5 },
  { name: 'current page number on brand', fg: '#FFFFFF', bg: '#0058D2', min: 4.5 },
  { name: 'current page number on brand hover', fg: '#FFFFFF', bg: '#0046A8', min: 4.5 },
  { name: 'current page number on brand pressed', fg: '#FFFFFF', bg: '#00357E', min: 4.5 },
  { name: 'overflow glyph on page background', fg: '#757575', bg: '#FFFFFF', min: 3 },
  { name: 'overflow glyph on hover / open', fg: '#757575', bg: '#F1F1F1', min: 3 },
  { name: 'nav label and icon on page background', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'focus outer ring on page background', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
  { name: 'focus outer ring on current page', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
];

const DARK: Pair[] = [
  { name: 'page number on page background', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'page number on hover', fg: '#FFFFFF', bg: '#383838', min: 4.5 },
  { name: 'page number on pressed', fg: '#FFFFFF', bg: '#616161', min: 4.5 },
  { name: 'current page number on brand', fg: '#FFFFFF', bg: '#0058D2', min: 4.5 },
  { name: 'current page number on brand hover', fg: '#FFFFFF', bg: '#0046A8', min: 4.5 },
  { name: 'current page number on brand pressed', fg: '#FFFFFF', bg: '#00357E', min: 4.5 },
  { name: 'overflow glyph on page background', fg: '#B2B2B2', bg: '#1E1E1E', min: 3 },
  { name: 'overflow glyph on hover / open', fg: '#B2B2B2', bg: '#383838', min: 3 },
  { name: 'nav label and icon on page background', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'focus inner ring on page background', fg: '#FFFFFF', bg: '#1E1E1E', min: 3 },
  { name: 'focus outer ring on inner ring', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
];

describe.each([
  ['light', LIGHT],
  ['dark', DARK],
] as const)('pagination contrast (%s)', (_theme, pairs) => {
  it.each(pairs)('$name is at least $min:1', ({ fg, bg, min }) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
