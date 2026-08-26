import { MUD_PHONE_COUNTRIES, findCountry, findCountryByDialCode } from './phone-countries';
import { applyMask, caretForDigitIndex, digitsBefore, digitsOf, isComplete, nationalOf, toE164 } from './phone-mask';

const MD = findCountry('MD')!;
const FR = findCountry('FR')!;
const DE = findCountry('DE')!;

describe('phone country table', () => {
  it('keeps every mask consistent with its digit window', () => {
    for (const country of MUD_PHONE_COUNTRIES) {
      expect(country.mask.replace(/[^X]/g, '').length, country.iso).toBe(country.maxDigits);
      expect(country.minDigits, country.iso).toBeLessThanOrEqual(country.maxDigits);
      expect(country.dialCode, country.iso).toMatch(/^\+\d+$/);
    }
  });

  it('resolves a country from an E.164 prefix, preferring the longest dial code', () => {
    expect(findCountryByDialCode('+37362123456')?.iso).toBe('MD');
    expect(findCountryByDialCode('+40721234567')?.iso).toBe('RO');
    // `+3` is a prefix of +33/+30/+34…, so length must decide, not table order.
    expect(findCountryByDialCode('+33612345678')?.iso).toBe('FR');
    expect(findCountryByDialCode('+359881234567')?.iso).toBe('BG');
    expect(findCountryByDialCode('+99900000')).toBeUndefined();
    expect(findCountryByDialCode('')).toBeUndefined();
  });
});

describe('digitsOf', () => {
  it('keeps only digits', () => {
    expect(digitsOf('062 12 345')).toBe('06212345');
    expect(digitsOf('+373 62 abc')).toBe('37362');
    expect(digitsOf('')).toBe('');
  });
});

describe('applyMask', () => {
  it('lays digits into the mask, adding separators as they are reached', () => {
    expect(applyMask('', MD)).toBe('');
    expect(applyMask('0', MD)).toBe('0');
    expect(applyMask('062', MD)).toBe('062');
    // The separator appears only once a digit follows it.
    expect(applyMask('0621', MD)).toBe('062 1');
    expect(applyMask('06212', MD)).toBe('062 12');
    expect(applyMask('062123', MD)).toBe('062 12 3');
    expect(applyMask('06212345', MD)).toBe('062 12 345');
  });

  it('clamps to the country maximum, dropping surplus digits', () => {
    expect(applyMask('0621234567890', MD)).toBe('062 12 345');
  });

  it('handles a mask whose first group is a single digit', () => {
    expect(applyMask('6', FR)).toBe('6');
    expect(applyMask('612', FR)).toBe('6 12');
    expect(applyMask('612345678', FR)).toBe('6 12 34 56 78');
  });

  it('allows a variable-length country to fill past its minimum', () => {
    expect(applyMask('1512345678', DE)).toBe('151 2345 678');
    expect(applyMask('15123456789', DE)).toBe('151 2345 6789');
  });

  it('strips non-digits from the incoming value', () => {
    expect(applyMask('062-12-345', MD)).toBe('062 12 345');
  });
});

describe('nationalOf', () => {
  it('strips the dial code from an E.164 number', () => {
    expect(nationalOf('+37362123456', MD)).toBe('62123456');
    expect(nationalOf('37362123456', MD)).toBe('62123456');
  });

  it('treats a value without the dial code as already national', () => {
    expect(nationalOf('62123456', MD)).toBe('62123456');
  });

  it('is empty for an empty value', () => {
    expect(nationalOf('', MD)).toBe('');
  });
});

describe('toE164', () => {
  it('joins the dial code and the national digits', () => {
    expect(toE164('062 12 345', MD)).toBe('+37306212345');
    expect(toE164('62123456', MD)).toBe('+37362123456');
  });

  it('is the empty string when there are no digits, never a bare dial code', () => {
    expect(toE164('', MD)).toBe('');
    expect(toE164('   ', MD)).toBe('');
  });
});

describe('isComplete', () => {
  it('is true only inside the country digit window', () => {
    expect(isComplete('6212345', MD)).toBe(false);
    expect(isComplete('62123456', MD)).toBe(true);
    // DE accepts 10 or 11.
    expect(isComplete('151234567', DE)).toBe(false);
    expect(isComplete('1512345678', DE)).toBe(true);
    expect(isComplete('15123456789', DE)).toBe(true);
  });

  it('is false for an empty value', () => {
    expect(isComplete('', MD)).toBe(false);
  });
});

describe('caret preservation', () => {
  it('counts the digits before a caret position', () => {
    //            0   1   2   3   4   5   6
    //            0   6   2   ' ' 1   2   ' '
    expect(digitsBefore('062 12 345', 0)).toBe(0);
    expect(digitsBefore('062 12 345', 3)).toBe(3);
    expect(digitsBefore('062 12 345', 4)).toBe(3);
    expect(digitsBefore('062 12 345', 6)).toBe(5);
    expect(digitsBefore('062 12 345', 10)).toBe(8);
  });

  it('maps a digit index back to the caret offset after that digit', () => {
    expect(caretForDigitIndex('062 12 345', 0)).toBe(0);
    expect(caretForDigitIndex('062 12 345', 3)).toBe(3);
    // After the 4th digit the caret sits past the separator, not before it.
    expect(caretForDigitIndex('062 12 345', 4)).toBe(5);
    expect(caretForDigitIndex('062 12 345', 8)).toBe(10);
  });

  it('round-trips: typing in the middle keeps the caret on the same digit', () => {
    // Start from "062 12 345" and type a 9 at offset 5 (just after "062 1"),
    // which the browser leaves as this raw value with the caret at 6.
    const raw = '062 192 345';
    const caret = 6;
    const digitIndex = digitsBefore(raw, caret);
    const masked = applyMask(raw, MD);

    expect(digitIndex).toBe(5);
    expect(masked).toBe('062 19 234');
    // The caret stays immediately after the 9 the user just typed.
    expect(caretForDigitIndex(masked, digitIndex)).toBe(6);
    expect(masked[caretForDigitIndex(masked, digitIndex) - 1]).toBe('9');
  });

  it('clamps a digit index past the end to the end of the masked value', () => {
    expect(caretForDigitIndex('062 12 345', 99)).toBe(10);
  });
});
