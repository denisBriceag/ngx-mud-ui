import {
  caretForDigitIndex,
  digitsBefore,
  displayToIso,
  formatMasked,
  formatSpec,
  ghostRemainder,
  isoToDisplay,
} from './date-mask';

const DMY = formatSpec('DD/MM/YYYY');
const MDY = formatSpec('MM/DD/YYYY');
const YMD = formatSpec('YYYY-MM-DD');

describe('date-mask', () => {
  describe('formatSpec', () => {
    it('describes the segment layout and separator', () => {
      expect(DMY.separator).toBe('/');
      expect(DMY.length).toBe(10);
      expect(DMY.segments.map((s) => s.kind)).toEqual(['DD', 'MM', 'YYYY']);
      expect(DMY.segments.map((s) => s.start)).toEqual([0, 3, 6]);
    });

    it('handles the dash-separated ISO layout', () => {
      expect(YMD.separator).toBe('-');
      expect(YMD.segments.map((s) => s.kind)).toEqual(['YYYY', 'MM', 'DD']);
      expect(YMD.segments.map((s) => s.start)).toEqual([0, 5, 8]);
    });
  });

  describe('formatMasked', () => {
    it('writes separators inline as digits arrive', () => {
      expect(formatMasked('1', DMY)).toBe('1');
      expect(formatMasked('1504', DMY)).toBe('15/04');
      expect(formatMasked('15042026', DMY)).toBe('15/04/2026');
    });

    it('holds the separator back until a digit follows it, so Backspace can delete', () => {
      // A trailing separator would be re-inserted by the very next re-mask,
      // leaving the user unable to delete backwards past it — see formatMasked.
      expect(formatMasked('15', DMY)).toBe('15');
      expect(formatMasked('150', DMY)).toBe('15/0');
      expect(formatMasked('15042', DMY)).toBe('15/04/2');
    });

    it('discards non-digits, so pasting a formatted date still works', () => {
      expect(formatMasked('15/04/2026', DMY)).toBe('15/04/2026');
      expect(formatMasked('15.04.2026', DMY)).toBe('15/04/2026');
    });

    it('truncates past the format length', () => {
      expect(formatMasked('150420269999', DMY)).toBe('15/04/2026');
    });

    it('masks the ISO layout with dashes', () => {
      expect(formatMasked('20260415', YMD)).toBe('2026-04-15');
      expect(formatMasked('2026', YMD)).toBe('2026');
      expect(formatMasked('20260', YMD)).toBe('2026-0');
    });

    it('returns empty for empty input', () => {
      expect(formatMasked('', DMY)).toBe('');
    });
  });

  describe('ghostRemainder', () => {
    it('returns the untyped tail of the pattern', () => {
      expect(ghostRemainder('', DMY)).toBe('DD/MM/YYYY');
      expect(ghostRemainder('15/04', DMY)).toBe('/YYYY');
      expect(ghostRemainder('15/0', DMY)).toBe('M/YYYY');
      expect(ghostRemainder('15/04/2026', DMY)).toBe('');
    });

    it('still lines up when the lazy separator has not been written yet', () => {
      // `15` renders a ghost that OPENS with the separator the mask has held
      // back. The offset is the display length either way, so the pattern
      // tail still lands exactly where the next glyph goes.
      expect(ghostRemainder('15', DMY)).toBe('/MM/YYYY');
      expect(ghostRemainder('2026', YMD)).toBe('-MM-DD');
    });
  });

  describe('displayToIso', () => {
    it('converts a complete entry', () => {
      expect(displayToIso('15/04/2026', DMY)).toBe('2026-04-15');
      expect(displayToIso('04/15/2026', MDY)).toBe('2026-04-15');
      expect(displayToIso('2026-04-15', YMD)).toBe('2026-04-15');
    });

    it('returns null while the entry is incomplete', () => {
      expect(displayToIso('15/04/', DMY)).toBeNull();
      expect(displayToIso('15/04/20', DMY)).toBeNull();
    });

    it('returns null for a complete but impossible date', () => {
      expect(displayToIso('31/02/2026', DMY)).toBeNull();
      expect(displayToIso('29/02/2025', DMY)).toBeNull();
    });

    it('accepts a real leap day', () => {
      expect(displayToIso('29/02/2024', DMY)).toBe('2024-02-29');
    });
  });

  describe('isoToDisplay', () => {
    it('renders in the configured order', () => {
      expect(isoToDisplay('2026-04-15', DMY)).toBe('15/04/2026');
      expect(isoToDisplay('2026-04-15', MDY)).toBe('04/15/2026');
      expect(isoToDisplay('2026-04-15', YMD)).toBe('2026-04-15');
    });

    it('renders an unusable value as empty rather than throwing', () => {
      expect(isoToDisplay('', DMY)).toBe('');
      expect(isoToDisplay('nonsense', DMY)).toBe('');
    });
  });

  describe('caret helpers', () => {
    it('counts digits before the caret', () => {
      expect(digitsBefore('15/04/2026', 4)).toBe(3);
      expect(digitsBefore('15/04/2026', 0)).toBe(0);
    });

    it('finds the offset just after the nth digit', () => {
      expect(caretForDigitIndex('15/04/2026', 3)).toBe(4);
      expect(caretForDigitIndex('15/04/2026', 0)).toBe(0);
      expect(caretForDigitIndex('15/04/2026', 99)).toBe(10);
    });

    it('lands at the end of the string for the last digit typed', () => {
      // The lazy separator means a masked string always ENDS on a digit, so
      // there is never a trailing separator to step over.
      expect(caretForDigitIndex('15', 2)).toBe(2);
      expect(caretForDigitIndex('15/04', 4)).toBe(5);
      expect(caretForDigitIndex('15/0', 3)).toBe(4);
    });

    it('keeps the caret on the touched digit for a mid-string edit', () => {
      // '12/50/4' has 5 digits; digit 2 (the '2') completed DD, but this is
      // not the last digit in the string, so the caret stays right after it.
      expect(caretForDigitIndex('12/50/4', 2)).toBe(2);
    });
  });
});
