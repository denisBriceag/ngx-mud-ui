/** Range endpoints as ISO `YYYY-MM-DD`; either side may be unset. */
export interface MudDateRange {
  start: string | null;
  end: string | null;
}

/**
 * Value shape per mode. Every mode is nullable so `null` is a legal default
 * for all three and the generic needs no casts.
 */
export interface MudDateValueMap {
  single: string | null;
  range: MudDateRange | null;
  multi: string[] | null;
}

export type MudDatePickerMode = keyof MudDateValueMap;
export type MudDateInputMode = 'single' | 'range';
export type MudDateValue<M extends MudDatePickerMode> = MudDateValueMap[M];

export type MudDatePickerAppearance = 'elevated' | 'flat';
export type MudDatePickerHeaderStyle = 'title' | 'dropdown';

/** Emitted whenever the visible month changes. `month` is 0-indexed. */
export interface MudDateMonthChange {
  year: number;
  month: number;
}

/** Which drill-down level the calendar is showing. */
export type MudDatePickerView = 'days' | 'months' | 'years';
