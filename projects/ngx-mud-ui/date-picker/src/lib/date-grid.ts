import { addDays, dayOfWeek, toIso } from './date-core';

export interface MudDayCell {
  /** ISO `YYYY-MM-DD`. */
  iso: string;
  /** Day of month, for the visible label. */
  day: number;
  /** True when the cell belongs to the previous or next month. */
  outside: boolean;
}

/** Cells per page: 6 rows of 7, fixed so the calendar never changes height. */
const DAY_CELLS = 42;

/** How many years one year-view page shows. */
const YEAR_PAGE = 24;

export function weekdayOrder(firstDayOfWeek: number): number[] {
  return Array.from({ length: 7 }, (_, i) => (firstDayOfWeek + i) % 7);
}

/** `month` is 1-indexed. */
export function buildDayGrid(year: number, month: number, firstDayOfWeek: number): MudDayCell[] {
  const firstIso = toIso({ y: year, m: month, d: 1 });
  const lead = (dayOfWeek(firstIso) - firstDayOfWeek + 7) % 7;
  const start = addDays(firstIso, -lead);

  return Array.from({ length: DAY_CELLS }, (_, i) => {
    const iso = addDays(start, i);

    return {
      iso,
      day: Number(iso.slice(8, 10)),
      outside: Number(iso.slice(5, 7)) !== month || Number(iso.slice(0, 4)) !== year,
    };
  });
}

export function yearPageStart(year: number): number {
  return Math.floor(year / YEAR_PAGE) * YEAR_PAGE;
}

export function buildYearPage(year: number): number[] {
  const start = yearPageStart(year);

  return Array.from({ length: YEAR_PAGE }, (_, i) => start + i);
}
