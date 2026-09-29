declare const ngDevMode: boolean | undefined;

/** `HH:MM`, 24-hour, or `null` when unset. */
export type MudTimeValue = string | null;

export interface MudTimeParts {
  hours: number;
  minutes: number;
}

/** The display pattern of the field; also its default placeholder. */
export const MUD_TIME_PATTERN = 'HH:MM';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Strict `HH:MM`: zero-padded, hours 00–23, minutes 00–59. */
export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_RE.test(value);
}

export function parseTime(value: string | null | undefined): MudTimeParts | null {
  const match = TIME_RE.exec(value ?? '');

  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null;
}

export function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Minutes since midnight of a valid `HH:MM`, else `null`. */
export function minuteOfDay(value: string | null | undefined): number | null {
  const time = parseTime(value);

  return time ? time.hours * 60 + time.minutes : null;
}

/** A bound arriving from a signal-forms schema is name-matched at runtime and
 *  not type-checked, so anything that is not `HH:MM` is ignored rather than
 *  allowed to block every commit. */
export function toValidTimeOrUndefined(value: string | undefined): string | undefined {
  return isValidTime(value) ? value : undefined;
}

/** Inclusive on both ends. A malformed bound counts as absent. */
export function isWithin(value: string, min?: string, max?: string): boolean {
  const at = minuteOfDay(value);

  if (at === null) return false;

  const lower = minuteOfDay(min);
  const upper = minuteOfDay(max);

  return (lower === null || at >= lower) && (upper === null || at <= upper);
}

/** Minute granularity the picker renders and the field accepts. */
export type MudMinuteStep = 1 | 5 | 10 | 15 | 30;

export const MUD_MINUTE_STEPS: readonly MudMinuteStep[] = [1, 5, 10, 15, 30];

/** Returns `true` for a SELECTABLE `HH:MM`; runs after `min`/`max` and `minuteStep`. */
export type MudTimeFilter = (time: string) => boolean;

export interface MudTimeConstraints {
  min?: string;
  max?: string;
  minuteStep?: MudMinuteStep;
  timeFilter?: MudTimeFilter;
}

/** A listed step, or 1 for anything else (attribute strings included). */
export function toMinuteStep(value: unknown): MudMinuteStep {
  const n = Number(value);

  return (MUD_MINUTE_STEPS as readonly number[]).includes(n) ? (n as MudMinuteStep) : 1;
}

/** The minute values a step renders: 0, step, 2·step … below 60. */
export function minutesForStep(step: MudMinuteStep): readonly number[] {
  return Array.from({ length: 60 / step }, (_, i) => i * step);
}

/** Bounds, then step, then filter — the one rule both the picker and the field apply. */
export function isSelectable(time: string, constraints: MudTimeConstraints): boolean {
  const parts = parseTime(time);

  if (!parts || !isWithin(time, constraints.min, constraints.max)) return false;

  if (constraints.minuteStep && parts.minutes % constraints.minuteStep !== 0) return false;

  // Only an explicit `false` refuses, as `dateFilter` does.
  return constraints.timeFilter?.(time) !== false;
}

/** Input transform for `minuteStep`: normalizes, and in dev mode warns once per set about an unlisted value. */
export function minuteStepTransform(tag: string): (value: unknown) => MudMinuteStep {
  return (value) => {
    const step = toMinuteStep(value);

    // `null` and `undefined` mean "unset", not "wrong".
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && value != null && Number(value) !== step) {
      console.warn(`[${tag}] minuteStep ${JSON.stringify(value)} is not one of 1, 5, 10, 15, 30; using 1.`);
    }

    return step;
  };
}
