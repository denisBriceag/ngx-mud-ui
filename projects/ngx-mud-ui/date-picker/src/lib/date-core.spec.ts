import {
  addDays,
  addMonths,
  compareIso,
  dayOfWeek,
  daysInMonth,
  isLeapYear,
  isValidIso,
  isWithin,
  mudDateFromDate,
  mudDateToDate,
  normalizeRange,
  parseIso,
  startOfMonth,
  toIso,
  toValidIsoOrUndefined,
} from './date-core';

describe('date-core', () => {
  describe('isValidIso', () => {
    it('accepts a well-formed calendar date', () => {
      expect(isValidIso('2026-08-27')).toBe(true);
    });

    it('rejects a datetime string, the shape consumers reach for first', () => {
      expect(isValidIso('1990-05-14T21:00:00.000Z')).toBe(false);
    });

    it('rejects dates that pass the regex but do not exist', () => {
      expect(isValidIso('2026-02-30')).toBe(false);
      expect(isValidIso('2025-02-29')).toBe(false);
      expect(isValidIso('2026-13-01')).toBe(false);
      expect(isValidIso('2026-00-10')).toBe(false);
    });

    it('accepts a real leap day', () => {
      expect(isValidIso('2024-02-29')).toBe(true);
    });
  });

  describe('parseIso / toIso round trip', () => {
    it('parses into a 1-indexed month', () => {
      expect(parseIso('2026-08-27')).toEqual({ y: 2026, m: 8, d: 27 });
    });

    it('returns null for junk instead of throwing', () => {
      expect(parseIso('nope')).toBeNull();
    });

    it('zero-pads on the way back out', () => {
      expect(toIso({ y: 2026, m: 1, d: 5 })).toBe('2026-01-05');
    });
  });

  describe('isLeapYear / daysInMonth', () => {
    it('applies the full Gregorian rule, not the divisible-by-4 shortcut', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('returns February length by year', () => {
      expect(daysInMonth(2024, 2)).toBe(29);
      expect(daysInMonth(2025, 2)).toBe(28);
      expect(daysInMonth(2026, 4)).toBe(30);
      expect(daysInMonth(2026, 12)).toBe(31);
    });
  });

  describe('dayOfWeek', () => {
    it('returns 0 for Sunday', () => {
      expect(dayOfWeek('2026-08-30')).toBe(0);
    });

    it('anchors correctly on the epoch (a Thursday)', () => {
      expect(dayOfWeek('1970-01-01')).toBe(4);
    });

    it('handles pre-epoch dates', () => {
      expect(dayOfWeek('1900-01-01')).toBe(1);
    });
  });

  describe('addDays', () => {
    it('crosses a month boundary', () => {
      expect(addDays('2026-08-31', 1)).toBe('2026-09-01');
    });

    it('crosses a year boundary backwards', () => {
      expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('crosses a leap day', () => {
      expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDays('2025-02-28', 1)).toBe('2025-03-01');
    });

    // The whole reason this module exists: civil-date math cannot be shifted
    // by a timezone transition, because no epoch instant is ever involved.
    it('is unaffected by a DST spring-forward day', () => {
      expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
      expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    });

    it('passes through when the target day falls outside the representable year range', () => {
      expect(addDays('0000-01-01', -1)).toBe('0000-01-01');
      expect(addDays('9999-12-31', 1)).toBe('9999-12-31');
    });
  });

  describe('addMonths', () => {
    it('clamps the day to the target month length', () => {
      expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
      expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    });

    it('walks across years in both directions', () => {
      expect(addMonths('2026-11-15', 2)).toBe('2027-01-15');
      expect(addMonths('2026-02-15', -3)).toBe('2025-11-15');
    });

    it('passes through when the target month falls outside the representable year range', () => {
      expect(addMonths('0000-01-15', -1)).toBe('0000-01-15');
      expect(addMonths('9999-12-15', 1)).toBe('9999-12-15');
    });
  });

  describe('startOfMonth', () => {
    it('returns the first day of the containing month', () => {
      expect(startOfMonth('2026-08-27')).toBe('2026-08-01');
      expect(startOfMonth('2026-02-01')).toBe('2026-02-01');
    });

    it('passes an unusable value through untouched', () => {
      expect(startOfMonth('nonsense')).toBe('nonsense');
    });
  });

  describe('compareIso / isWithin', () => {
    it('orders lexicographically', () => {
      expect(compareIso('2026-08-01', '2026-08-02')).toBeLessThan(0);
      expect(compareIso('2026-08-02', '2026-08-01')).toBeGreaterThan(0);
      expect(compareIso('2026-08-02', '2026-08-02')).toBe(0);
    });

    it('treats bounds as inclusive', () => {
      expect(isWithin('2026-05-01', '2026-05-01', '2026-09-01')).toBe(true);
      expect(isWithin('2026-09-01', '2026-05-01', '2026-09-01')).toBe(true);
      expect(isWithin('2026-04-30', '2026-05-01', undefined)).toBe(false);
    });
  });

  describe('normalizeRange', () => {
    it('keeps an already-ordered pair as it is', () => {
      expect(normalizeRange('2026-08-10', '2026-08-14')).toEqual({
        start: '2026-08-10',
        end: '2026-08-14',
      });
    });

    it('swaps a reversed pair, so entering the later date first still works', () => {
      expect(normalizeRange('2026-08-14', '2026-08-10')).toEqual({
        start: '2026-08-10',
        end: '2026-08-14',
      });
    });

    it('accepts a single-day range', () => {
      expect(normalizeRange('2026-08-10', '2026-08-10')).toEqual({
        start: '2026-08-10',
        end: '2026-08-10',
      });
    });
  });

  describe('toValidIsoOrUndefined', () => {
    it('passes a valid ISO date through', () => {
      expect(toValidIsoOrUndefined('2026-08-27')).toBe('2026-08-27');
    });

    it('discards a non-ISO string', () => {
      expect(toValidIsoOrUndefined('not-a-date')).toBeUndefined();
    });

    it('discards a value of the wrong runtime type, as a signal-forms schema can hand it', () => {
      expect(toValidIsoOrUndefined({ start: '2026-08-10', end: null })).toBeUndefined();
      expect(toValidIsoOrUndefined(undefined)).toBeUndefined();
      expect(toValidIsoOrUndefined(null)).toBeUndefined();
    });
  });

  describe('public converters', () => {
    it('reads the LOCAL calendar date off a Date', () => {
      expect(mudDateFromDate(new Date(1990, 4, 15, 23, 30))).toBe('1990-05-15');
    });

    it('returns a Date at local noon so no DST shift can cross a day', () => {
      const d = mudDateToDate('2026-03-29');

      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(2);
      expect(d.getDate()).toBe(29);
      expect(d.getHours()).toBe(12);
    });

    it('round-trips through Date without drifting', () => {
      expect(mudDateFromDate(mudDateToDate('2026-08-27'))).toBe('2026-08-27');
    });
  });
});
