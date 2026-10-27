import { MUD_TIME_PATTERN, parseTime } from './time-core';

/** Highest value of each two-digit segment: hours, then minutes. */
const SEGMENT_MAX = [23, 59] as const;

function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/** Fits typed digits into HH/MM: an impossible first digit pads to `0d`, an overflowing second is dropped. */
export function acceptDigits(raw: string): string {
  let out = '';
  let segment = 0;
  let current = '';

  for (const digit of digitsOf(raw)) {
    if (segment >= SEGMENT_MAX.length) break;

    const max = SEGMENT_MAX[segment];

    if (current === '' && Number(digit) > Math.floor(max / 10)) current = `0${digit}`;
    else if (current !== '' && Number(current + digit) > max) continue;
    else current += digit;

    if (current.length === 2) {
      out += current;
      current = '';
      segment += 1;
    }
  }

  return out + current;
}

/** Re-formats raw input as `HH:MM`; the `:` is lazy or Backspace could never delete it. */
export function formatMasked(raw: string): string {
  const digits = acceptDigits(raw);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** The untyped tail of the pattern, rendered behind the caret. */
export function ghostRemainder(display: string): string {
  return MUD_TIME_PATTERN.slice(display.length);
}

/** The complete `HH:MM` a display resolves to; `null` while incomplete. */
export function displayToTime(display: string): string | null {
  return parseTime(display) ? display : null;
}

/** `:` typed after a lone hour digit pads it (`2` → `02`); `null` when the key does not apply. */
export function padHourOnSeparator(display: string, key: string): string | null {
  return key === ':' && /^\d$/.test(display) ? `0${display}` : null;
}

export function digitsBefore(value: string, caret: number): number {
  return digitsOf(value.slice(0, Math.max(0, caret))).length;
}

/** Offset right after the nth digit, so a re-mask keeps the caret where the user was typing. */
export function caretForDigitIndex(masked: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;

  let seen = 0;

  for (let i = 0; i < masked.length; i += 1) {
    if (!/\d/.test(masked[i])) continue;

    seen += 1;

    if (seen === digitIndex) return i + 1;
  }

  return masked.length;
}
