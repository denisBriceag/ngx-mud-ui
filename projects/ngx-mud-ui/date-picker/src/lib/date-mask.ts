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

/** Masks digits into the format (`1504` → `15/04`); the separator is lazy or Backspace could never delete it. */
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
