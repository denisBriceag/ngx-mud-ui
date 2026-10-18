import { InjectionToken } from '@angular/core';
import type { Provider, Signal } from '@angular/core';
import { _provideMudLabels } from 'ngx-mud-ui/core';

/**
 * Every user-facing string the date components render. Defaults are English;
 * localize an entire app with one `provideMudDateLabels` call - pass a signal
 * (or a factory returning one) and the calendars re-render live when it
 * changes, so a runtime language switch needs no per-instance wiring.
 */
export interface MudDateLabels {
  /**
   * BCP 47 locale for `Intl`-derived month/weekday names, so one signal can
   * switch strings AND names together. Precedence: a component's own `locale`
   * input, then this, then the app `LOCALE_ID`.
   */
  locale?: string;

  /** Accessible name of the calendar popover dialog. */
  calendar: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  /** Header button that opens the month grid. */
  chooseMonth: string;
  /** Header button that opens the year grid. */
  chooseYear: string;
  /** "Today" quick-jump shortcut. */
  today: string;
  /** Clear (×) button. */
  clear: string;
  /** Accessible name of the range start field. */
  rangeStart: string;
  /** Accessible name of the range end field. */
  rangeEnd: string;
  /**
   * Twelve SHORT month names for the month-picker grid, January first
   * (`['Ian', 'Feb', …]`). If empty - derived from `Intl` for the active locale.
   */
  monthNamesShort?: readonly string[];

  /**
   * Twelve FULL month names, January first, the header title, the dropdown
   * chip, announcements, and the month buttons' accessible names. Unset:
   * derived from `Intl` for the active locale.
   */
  monthNamesLong?: readonly string[];

  /** Describes the expected entry format, e.g. "Date format: DD/MM/YYYY". */
  formatHint: (pattern: string) => string;
  /** Announced after the visible month changes. */
  monthChanged: (monthYear: string) => string;
  /** Announced after the first date of a range is picked. */
  rangeStartSelected: (start: string) => string;
  /** Announced once a range is complete. */
  rangeSelected: (start: string, end: string) => string;
}

export const MUD_DATE_LABELS_DEFAULT: MudDateLabels = {
  calendar: 'Calendar',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  chooseMonth: 'Choose month',
  chooseYear: 'Choose year',
  today: 'Today',
  clear: 'Clear',
  rangeStart: 'Start date',
  rangeEnd: 'End date',
  formatHint: (pattern) => `Date format: ${pattern}`,
  monthChanged: (monthYear) => monthYear,
  rangeStartSelected: (start) => `${start} selected, choose end date`,
  rangeSelected: (start, end) => `${start} to ${end} selected`,
};

export const MUD_DATE_LABELS = new InjectionToken<MudDateLabels | Signal<MudDateLabels>>(
  'MUD_DATE_LABELS',
  {
    providedIn: 'root',
    factory: () => MUD_DATE_LABELS_DEFAULT,
  },
);

/**
 * Overrides only the keys you pass; the rest keep their English defaults.
 *
 * Three shapes:
 * - a plain partial — static labels;
 * - a `Signal<Partial<MudDateLabels>>` - the calendars re-render when it changes;
 * - a factory returning either - runs in an injection context, so it can
 *   `inject()` your i18n service:
 *
 * ```ts
 * provideMudDateLabels(() => {
 *   const i18n = inject(I18nService);
 *   return computed(() => (i18n.lang() === 'ro' ? RO_DATE_LABELS : {}));
 * })
 * ```
 */
export function provideMudDateLabels(
  labels: Partial<MudDateLabels> | Signal<Partial<MudDateLabels>> | (() => Partial<MudDateLabels> | Signal<Partial<MudDateLabels>>),
): Provider {
  return _provideMudLabels(MUD_DATE_LABELS, MUD_DATE_LABELS_DEFAULT, labels);
}
