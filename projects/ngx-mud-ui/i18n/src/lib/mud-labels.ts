import type { Signal } from '@angular/core';

/** Every built-in string of the library, grouped by component. */
export interface MudLabels {
  avatar: { initials: (initials: string) => string; fallback: string };
  badge: { notification: string };
  banner: { close: string };
  breadcrumb: { navigation: string; overflow: string };
  chip: { remove: (label: string) => string };
  datePicker: {
    calendar: string;
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    chooseMonth: (month: string) => string;
    chooseYear: (year: string) => string;
    today: string;
    clear: string;
    rangeStart: string;
    rangeEnd: string;
    formatHint: (pattern: string) => string;
    monthChanged: (monthYear: string) => string;
    rangeStartSelected: (start: string) => string;
    rangeSelected: (start: string, end: string) => string;
    monthNamesShort?: readonly string[];
    monthNamesLong?: readonly string[];
  };
  dialog: { close: string };
  fileInput: {
    cta: string;
    chooseFiles: string;
    dropzoneActive: string;
    fileList: string;
    required: string;
    formats: (formats: readonly string[]) => string;
    maxSize: (size: string) => string;
    added: (names: readonly string[]) => string;
    removed: (name: string) => string;
    rejected: (name: string) => string;
  };
  fileItem: { remove: (filename: string) => string; cancel: (filename: string) => string };
  fileSize: { units: readonly [string, string, string, string, string] };
  infoBox: { close: string };
  inputChip: {
    remove: (chip: string) => string;
    added: (chip: string) => string;
    removed: (chip: string) => string;
    rejectedPattern: (value: string) => string;
    rejectedDuplicate: (value: string) => string;
    rejectedMax: string;
  };
  numericInput: { increment: string; decrement: string; clear: string };
  pagination: {
    navigation: string;
    previous: string;
    next: string;
    previousAria: (page: number) => string;
    nextAria: (page: number) => string;
    pageAria: (page: number, total: number) => string;
    overflowAria: (from: number, to: number) => string;
  };
  phoneInput: {
    clear: string;
    country: (name: string, dialCode: string) => string;
    countryList: string;
    countrySearch: string;
    countryEmpty: string;
  };
  searchInput: { submit: string; clear: string };
  selectInput: { options: string; empty: string; noResults: string; loading: string };
  spinner: { loading: string };
  stepper: { completed: string; blocked: string };
  table: { sort: string };
  textInput: { clear: string };
  timePicker: {
    picker: string;
    openPicker: string;
    hours: string;
    minutes: string;
    clear: string;
    formatHint: (pattern: string) => string;
  };
  toast: { close: string };
  tooltip: { close: string; coachHint: string };
}

/** Any subset of `MudLabels`, per namespace. */
export type MudLabelsPartial = { [K in keyof MudLabels]?: Partial<MudLabels[K]> };

/** What `provideMudLabels` accepts: a partial, a signal of one, or a factory returning either. */
export type MudLabelsInput = MudLabelsPartial | Signal<MudLabelsPartial> | (() => MudLabelsPartial | Signal<MudLabelsPartial>);

/** The English defaults. */
export const MUD_LABELS_EN: MudLabels = {
  avatar: { initials: (i) => `Avatar for ${i}`, fallback: 'User avatar' },
  badge: { notification: 'Notification' },
  banner: { close: 'Close' },
  breadcrumb: { navigation: 'Breadcrumb', overflow: 'Show collapsed pages' },
  chip: { remove: (l) => `Remove ${l}` },
  datePicker: {
    calendar: 'Calendar',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    chooseMonth: (m) => `${m}, Choose month`,
    chooseYear: (y) => `${y}, Choose year`,
    today: 'Today',
    clear: 'Clear',
    rangeStart: 'Start date',
    rangeEnd: 'End date',
    formatHint: (pattern) => `Date format: ${pattern}`,
    monthChanged: (monthYear) => monthYear,
    rangeStartSelected: (start) => `${start} selected, choose end date`,
    rangeSelected: (start, end) => `${start} to ${end} selected`,
  },
  dialog: { close: 'Close' },
  fileInput: {
    cta: 'Drag and drop or ',
    chooseFiles: 'Choose files',
    dropzoneActive: 'Release to upload',
    fileList: 'Selected files',
    required: 'required',
    formats: (f) => `Accepted formats: ${f.join(', ')}`,
    maxSize: (size) => `Max size: ${size}`,
    added: (names) => (names.length === 1 ? `${names[0]} added` : `${names.length} files added`),
    removed: (name) => `${name} removed`,
    rejected: (name) => `${name} was rejected`,
  },
  fileItem: { remove: (f) => `Remove file ${f}`, cancel: (f) => `Cancel upload ${f}` },
  fileSize: { units: ['B', 'KB', 'MB', 'GB', 'TB'] },
  infoBox: { close: 'Close' },
  inputChip: {
    remove: (c) => `Remove ${c}`,
    added: (chip) => `${chip} added`,
    removed: (chip) => `${chip} removed`,
    rejectedPattern: (value) => `${value} is not in the expected format`,
    rejectedDuplicate: (value) => `${value} is already added`,
    rejectedMax: 'Maximum number of values reached',
  },
  numericInput: { increment: 'Increase', decrement: 'Decrease', clear: 'Clear' },
  pagination: {
    navigation: 'Pagination',
    previous: 'Previous',
    next: 'Next',
    previousAria: (page) => `Previous page, go to page ${page}`,
    nextAria: (page) => `Next page, go to page ${page}`,
    pageAria: (page, total) => `Page ${page} of ${total}`,
    overflowAria: (from, to) => `Show pages ${from} to ${to}`,
  },
  phoneInput: {
    clear: 'Clear',
    country: (n, d) => `Country: ${n} ${d}`,
    countryList: 'Country',
    countrySearch: 'Search country',
    countryEmpty: 'No countries found',
  },
  searchInput: { submit: 'Search', clear: 'Clear' },
  selectInput: { options: 'Options', empty: 'No options', noResults: 'No results', loading: 'Loading…' },
  spinner: { loading: 'Loading' },
  stepper: { completed: 'completed', blocked: 'has errors' },
  table: { sort: 'Sort' },
  textInput: { clear: 'Clear field' },
  timePicker: {
    picker: 'Time',
    openPicker: 'Open time picker',
    hours: 'Hours',
    minutes: 'Minutes',
    clear: 'Clear',
    formatHint: (pattern) => `Time format: ${pattern}`,
  },
  toast: { close: 'Close' },
  tooltip: { close: 'Close', coachHint: 'Press Esc to close' },
};
