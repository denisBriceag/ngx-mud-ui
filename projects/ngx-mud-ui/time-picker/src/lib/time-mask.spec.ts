import {
  acceptDigits,
  caretForDigitIndex,
  digitsBefore,
  displayToTime,
  formatMasked,
  ghostRemainder,
  padHourOnSeparator,
} from './time-mask';

describe('time-mask', () => {
  describe('acceptDigits', () => {
    it('keeps digits that can still form a valid segment', () => {
      expect(acceptDigits('')).toBe('');
      expect(acceptDigits('0')).toBe('0');
      expect(acceptDigits('2')).toBe('2');
      expect(acceptDigits('23')).toBe('23');
      expect(acceptDigits('2359')).toBe('2359');
    });

    it('pads a first digit that cannot start a segment', () => {
      // No hour starts with 3–9, no minute with 6–9.
      expect(acceptDigits('3')).toBe('03');
      expect(acceptDigits('9')).toBe('09');
      expect(acceptDigits('097')).toBe('0907');
    });

    it('drops a second digit that overflows the segment', () => {
      expect(acceptDigits('27')).toBe('2');
      expect(acceptDigits('259')).toBe('2');
    });

    it('pads a first minute digit of 6-9 whatever follows it', () => {
      // The same prefix must yield the same result typed or pasted.
      expect(acceptDigits('236')).toBe('2306');
      expect(acceptDigits('2360')).toBe('2306');
      expect(acceptDigits('0997')).toBe('0909');
    });

    it('ignores non-digits and stops at four digits', () => {
      expect(acceptDigits('09:30')).toBe('0930');
      expect(acceptDigits('09.30')).toBe('0930');
      expect(acceptDigits('093015')).toBe('0930');
    });
  });

  describe('formatMasked', () => {
    it('writes the separator only once a minute digit exists', () => {
      // Lazy separator: an eager `09:` made Backspace unable to delete it.
      expect(formatMasked('0')).toBe('0');
      expect(formatMasked('09')).toBe('09');
      expect(formatMasked('093')).toBe('09:3');
      expect(formatMasked('0930')).toBe('09:30');
    });

    it('re-masks a pasted value', () => {
      expect(formatMasked('9.30')).toBe('09:30');
      expect(formatMasked('930')).toBe('09:30');
    });

    it('lets the separator go on deletion', () => {
      expect(formatMasked('09:')).toBe('09');
    });
  });

  it('ghostRemainder is the untyped tail of HH:MM', () => {
    expect(ghostRemainder('')).toBe('HH:MM');
    expect(ghostRemainder('09')).toBe(':MM');
    expect(ghostRemainder('09:3')).toBe('M');
    expect(ghostRemainder('09:30')).toBe('');
  });

  it('displayToTime resolves only a complete entry', () => {
    expect(displayToTime('09:30')).toBe('09:30');
    expect(displayToTime('09:3')).toBeNull();
    expect(displayToTime('')).toBeNull();
  });

  it('padHourOnSeparator pads a lone hour digit on ":" only', () => {
    expect(padHourOnSeparator('2', ':')).toBe('02');
    expect(padHourOnSeparator('0', ':')).toBe('00');
    expect(padHourOnSeparator('', ':')).toBeNull();
    expect(padHourOnSeparator('09', ':')).toBeNull();
    expect(padHourOnSeparator('09:3', ':')).toBeNull();
    expect(padHourOnSeparator('2', '.')).toBeNull();
  });

  it('caret helpers count digits, not characters', () => {
    expect(digitsBefore('09:3', 3)).toBe(2);
    expect(digitsBefore('09:3', 4)).toBe(3);
    expect(caretForDigitIndex('09:30', 0)).toBe(0);
    expect(caretForDigitIndex('09:30', 2)).toBe(2);
    expect(caretForDigitIndex('09:30', 3)).toBe(4);
    expect(caretForDigitIndex('09:30', 9)).toBe(5);
  });
});
