import { InjectionToken } from '@angular/core';
import type { Provider } from '@angular/core';

/**
 * Every user-facing string the date components render. Defaults are English;
 * localize an entire app with one `provideMudDateLabels` call.
 */
export interface MudDateLabels {
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

export const MUD_DATE_LABELS = new InjectionToken<MudDateLabels>('MUD_DATE_LABELS', {
  providedIn: 'root',
  factory: () => MUD_DATE_LABELS_DEFAULT,
});

/** Overrides only the keys you pass; the rest keep their English defaults. */
export function provideMudDateLabels(labels: Partial<MudDateLabels>): Provider {
  return { provide: MUD_DATE_LABELS, useValue: { ...MUD_DATE_LABELS_DEFAULT, ...labels } };
}
