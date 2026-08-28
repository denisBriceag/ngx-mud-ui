import { isValidIso, toIso } from './date-core';

export type MudDateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type MudDateSegmentKind = 'DD' | 'MM' | 'YYYY';

export interface MudDateSegment {
  kind: MudDateSegmentKind;
  /** Digit count: 2 for DD/MM, 4 for YYYY. */
  length: number;
  /** Offset of the segment's first digit within the display string. */
  start: number;
}

export interface MudDateFormatSpec {
  format: MudDateFormat;
  separator: string;
  segments: MudDateSegment[];
  /** Length of a fully-typed display value. */
  length: number;
}

const ORDERS: Record<MudDateFormat, { separator: string; kinds: MudDateSegmentKind[] }> = {
  'DD/MM/YYYY': { separator: '/', kinds: ['DD', 'MM', 'YYYY'] },
  'MM/DD/YYYY': { separator: '/', kinds: ['MM', 'DD', 'YYYY'] },
  'YYYY-MM-DD': { separator: '-', kinds: ['YYYY', 'MM', 'DD'] },
};

const specCache = new Map<MudDateFormat, MudDateFormatSpec>();

export function formatSpec(format: MudDateFormat): MudDateFormatSpec {
  const cached = specCache.get(format);

  if (cached) return cached;

  const { separator, kinds } = ORDERS[format];
  let start = 0;

  const segments = kinds.map((kind) => {
    const length = kind === 'YYYY' ? 4 : 2;
    const segment: MudDateSegment = { kind, length, start };

    start += length + 1;

    return segment;
  });

  const spec: MudDateFormatSpec = { format, separator, segments, length: format.length };

  specCache.set(format, spec);

  return spec;
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Strips everything that isn't a digit, then walks the segment spec inserting
 * the separator between segments. Typing `1504` yields `15/04`, so the
 * separator is never something the user has to press.
 *
 * The separator is LAZY — emitted only when a following digit exists — exactly
 * as `phone-input`'s `phone-mask` does it. Appending it the instant a segment
 * filled (`15` → `15/`) made the field un-deletable: Backspace removes the
 * `/`, the re-mask puts it straight back, and the user can never delete the
 * month, never the day, and never clear the field with Backspace at all.
 */
export function formatMasked(raw: string, spec: MudDateFormatSpec): string {
  const maxDigits = spec.segments.reduce((sum, segment) => sum + segment.length, 0);
  const digits = digitsOf(raw).slice(0, maxDigits);

  if (!digits) return '';

  let out = '';
  let next = 0;

  for (const segment of spec.segments) {
    const chunk = digits.slice(next, next + segment.length);

    if (!chunk) break;

    out += chunk;
    next += chunk.length;

    // Nothing typed past this segment yet, so there is no separator to write —
    // and the last segment can never have anything past it.
    if (next >= digits.length) break;

    out += spec.separator;
  }

  return out;
}

/** The untyped tail of the format pattern, rendered behind the caret. */
export function ghostRemainder(display: string, spec: MudDateFormatSpec): string {
  return spec.format.slice(display.length);
}

/** ISO string for a complete, real date; `null` while incomplete or impossible. */
export function displayToIso(display: string, spec: MudDateFormatSpec): string | null {
  if (display.length !== spec.length) return null;

  const part = (kind: MudDateSegmentKind): number => {
    const segment = spec.segments.find((candidate) => candidate.kind === kind)!;

    return Number(display.slice(segment.start, segment.start + segment.length));
  };

  const iso = toIso({ y: part('YYYY'), m: part('MM'), d: part('DD') });

  return isValidIso(iso) ? iso : null;
}

export function isoToDisplay(iso: string, spec: MudDateFormatSpec): string {
  if (!isValidIso(iso)) return '';

  const values: Record<MudDateSegmentKind, string> = {
    YYYY: iso.slice(0, 4),
    MM: iso.slice(5, 7),
    DD: iso.slice(8, 10),
  };

  return spec.segments.map((segment) => values[segment.kind]).join(spec.separator);
}

export function digitsBefore(value: string, caret: number): number {
  return digitsOf(value.slice(0, Math.max(0, caret))).length;
}

/**
 * Offset immediately after the nth digit, so a re-mask restores the caret to
 * the digit the user was working on instead of flinging it to the end.
 *
 * Task 14 needed an extra clause here — when the nth digit was the LAST one
 * typed and a just-auto-inserted separator followed it, the caret had to land
 * after that separator, or it would visibly stall one position short of where
 * forward typing continues. `formatMasked`'s separator is now lazy, so a
 * masked string always ENDS on a digit: for the last digit, `i + 1` is already
 * the end of the string and there is no separator left to step over. The
 * clause was removed with the bug that made it necessary.
 */
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
