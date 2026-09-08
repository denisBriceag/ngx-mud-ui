/** A civil (calendar) date. `m` is 1-indexed, unlike `Date.getMonth()`. */
export interface MudCivilDate {
  y: number;
  m: number;
  d: number;
}

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Days between the civil date and 1970-01-01, by Howard Hinnant's
 * `days_from_civil`. Pure integer arithmetic — no `Date`, so no timezone or
 * DST transition can influence the result.
 */
function daysFromCivil({ y, m, d }: MudCivilDate): number {
  const year = y - (m <= 2 ? 1 : 0);
  const era = Math.floor(year / 400);
  const yoe = year - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;

  return era * 146097 + doe - 719468;
}

/** Inverse of {@link daysFromCivil}. */
function civilFromDays(days: number): MudCivilDate {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const year = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);

  return { y: year + (m <= 2 ? 1 : 0), m, d };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** `month` is 1-indexed. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * True only for a `YYYY-MM-DD` string naming a date that exists. Datetime
 * strings are rejected on purpose — see the strict-format decision in the spec.
 */
export function isValidIso(value: string): boolean {
  const match = ISO_PATTERN.exec(value);

  if (!match) return false;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m);
}

export function parseIso(value: string): MudCivilDate | null {
  if (!isValidIso(value)) return null;

  return { y: Number(value.slice(0, 4)), m: Number(value.slice(5, 7)), d: Number(value.slice(8, 10)) };
}

export function toIso({ y, m, d }: MudCivilDate): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Years outside this range cannot round-trip through a four-digit ISO string. */
function isRepresentable({ y }: MudCivilDate): boolean {
  return y >= 0 && y <= 9999;
}

/** 0 = Sunday … 6 = Saturday. 1970-01-01 was a Thursday, hence the +4. */
export function dayOfWeek(iso: string): number {
  const date = parseIso(iso);

  if (!date) return 0;

  return (((daysFromCivil(date) + 4) % 7) + 7) % 7;
}

export function addDays(iso: string, amount: number): string {
  const date = parseIso(iso);

  if (!date) return iso;

  const next = civilFromDays(daysFromCivil(date) + amount);

  return isRepresentable(next) ? toIso(next) : iso;
}

/** Clamps the day to the target month's length: Jan 31 + 1 month = Feb 28/29. */
export function addMonths(iso: string, amount: number): string {
  const date = parseIso(iso);

  if (!date) return iso;

  const total = date.y * 12 + (date.m - 1) + amount;
  const y = Math.floor(total / 12);
  const m = (((total % 12) + 12) % 12) + 1;
  const next = { y, m, d: Math.min(date.d, daysInMonth(y, m)) };

  return isRepresentable(next) ? toIso(next) : iso;
}

/** First day of the containing month; unusable input passes through. */
export function startOfMonth(iso: string): string {
  const date = parseIso(iso);

  return date ? toIso({ ...date, d: 1 }) : iso;
}

/** ISO dates sort lexicographically, so this is a plain string comparison. */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Orders a range's endpoints, so entering the later date first still yields a
 * valid range. Shared by the calendar's range-completion path and the field's
 * range commit — the two used to make opposite choices for the same user
 * intent (the calendar swapped, the field nullified the end), which is exactly
 * what a shared helper prevents from drifting apart again.
 */
export function normalizeRange(a: string, b: string): { start: string; end: string } {
  return compareIso(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

/** Inclusive on both bounds; an absent bound is unbounded. */
export function isWithin(iso: string, min?: string, max?: string): boolean {
  if (min && compareIso(iso, min) < 0) return false;

  if (max && compareIso(iso, max) > 0) return false;

  return true;
}

/** Passes an ISO date through, and anything else out. Bounds arriving from a
 *  signal-forms schema are name-matched at runtime and are not type-checked. */
export function toValidIsoOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && isValidIso(value) ? value : undefined;
}

// ----- public converters (exported from the entry point) -----

/** Reads the LOCAL calendar date off a `Date`. */
export function mudDateFromDate(date: Date): string {
  return toIso({ y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() });
}

/**
 * Local **noon**, not midnight: a DST transition can move midnight across a
 * day boundary, noon cannot. `new Date('2026-08-27')` would parse as UTC and
 * reintroduce exactly the bug this library avoids.
 */
export function mudDateToDate(iso: string): Date {
  const date = parseIso(iso);

  if (!date) return new Date(NaN);

  return new Date(date.y, date.m - 1, date.d, 12, 0, 0, 0);
}

export function mudToday(): string {
  return mudDateFromDate(new Date());
}

export function mudAddDays(iso: string, amount: number): string {
  return addDays(iso, amount);
}
