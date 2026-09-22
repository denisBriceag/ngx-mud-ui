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

// The focus ring is two rings: 2px inner (white in both themes) then 3px outer (blue). Against
// light headers the OUTER ring carries the contrast; against dark headers the INNER one does,
// and the outer must then contrast with the inner. Both faces are pinned below.
const LIGHT: Pair[] = [
  { name: 'subtle header text on subtle header', fg: '#121212', bg: '#F1F1F1', min: 4.5 },
  { name: 'strong header text on strong header', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'white header text on white header', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'cell text on row', fg: '#383838', bg: '#FFFFFF', min: 4.5 },
  { name: 'cell text on zebra row', fg: '#383838', bg: '#F5F5F5', min: 4.5 },
  { name: 'cell text on hover row', fg: '#383838', bg: '#F1F1F1', min: 4.5 },
  { name: 'selected row text (on-color) on selected row', fg: '#121212', bg: '#E8F0FB', min: 4.5 },
  { name: 'selected row text (on-color) on selected+hover row', fg: '#121212', bg: '#CCDEF6', min: 4.5 },
  { name: 'footer text on row', fg: '#121212', bg: '#FFFFFF', min: 4.5 },
  { name: 'empty-state text on row', fg: '#757575', bg: '#FFFFFF', min: 4.5 },
  { name: 'sort icon on subtle header', fg: '#121212', bg: '#F1F1F1', min: 3 },
  { name: 'sort icon on strong header', fg: '#FFFFFF', bg: '#1E1E1E', min: 3 },
  { name: 'focus outer ring on subtle header', fg: '#3379DB', bg: '#F1F1F1', min: 3 },
  { name: 'focus outer ring on white header', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
  { name: 'focus inner ring on strong header', fg: '#FFFFFF', bg: '#1E1E1E', min: 3 },
];

const DARK: Pair[] = [
  { name: 'subtle header text on subtle header', fg: '#FFFFFF', bg: '#383838', min: 4.5 },
  { name: 'strong header text on strong header', fg: '#121212', bg: '#F5F5F5', min: 4.5 },
  { name: 'white header text on white header', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'cell text on row', fg: '#F1F1F1', bg: '#1E1E1E', min: 4.5 },
  { name: 'cell text on zebra row', fg: '#F1F1F1', bg: '#2C2C2C', min: 4.5 },
  { name: 'cell text on hover row', fg: '#F1F1F1', bg: '#383838', min: 4.5 },
  { name: 'selected row text (on-color) on selected row', fg: '#121212', bg: '#CCDEF6', min: 4.5 },
  { name: 'selected row text (on-color) on selected+hover row', fg: '#121212', bg: '#99BCED', min: 4.5 },
  { name: 'footer text on row', fg: '#FFFFFF', bg: '#1E1E1E', min: 4.5 },
  { name: 'empty-state text on row', fg: '#B2B2B2', bg: '#1E1E1E', min: 4.5 },
  { name: 'sort icon on subtle header', fg: '#FFFFFF', bg: '#383838', min: 3 },
  { name: 'sort icon on strong header', fg: '#121212', bg: '#F5F5F5', min: 3 },
  { name: 'focus inner ring on subtle header', fg: '#FFFFFF', bg: '#383838', min: 3 },
  { name: 'focus outer ring on inner ring', fg: '#3379DB', bg: '#FFFFFF', min: 3 },
  { name: 'focus outer ring on strong header', fg: '#3379DB', bg: '#F5F5F5', min: 3 },
];

describe.each([
  ['light', LIGHT],
  ['dark', DARK],
] as const)('table contrast (%s)', (_theme, pairs) => {
  it.each(pairs)('$name is at least $min:1', ({ fg, bg, min }) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});
