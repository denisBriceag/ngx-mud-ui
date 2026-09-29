import { computed, InjectionToken, isSignal } from '@angular/core';
import type { Provider, Signal } from '@angular/core';

/**
 * Every user-facing string the time components render. Defaults are English;
 * localize an entire app with one `provideMudTimeLabels` call — pass a signal
 * (or a factory returning one) and the components re-render live when it
 * changes, so a runtime language switch needs no per-instance wiring.
 */
export interface MudTimeLabels {
  /** Accessible name of the picker (standalone group and popover dialog). */
  picker: string;
  /** Accessible name of the clock button that opens the popover. */
  openPicker: string;
  /** Accessible name of the hour listbox. */
  hours: string;
  /** Accessible name of the minute listbox. */
  minutes: string;
  /** Clear (×) button. */
  clear: string;
  /** Describes the expected entry format, e.g. "Time format: HH:MM". */
  formatHint: (pattern: string) => string;
}

export const MUD_TIME_LABELS_DEFAULT: MudTimeLabels = {
  picker: 'Time',
  openPicker: 'Open time picker',
  hours: 'Hours',
  minutes: 'Minutes',
  clear: 'Clear',
  formatHint: (pattern) => `Time format: ${pattern}`,
};

export const MUD_TIME_LABELS = new InjectionToken<MudTimeLabels | Signal<MudTimeLabels>>(
  'MUD_TIME_LABELS',
  {
    providedIn: 'root',
    factory: () => MUD_TIME_LABELS_DEFAULT,
  },
);

/**
 * Overrides only the keys you pass; the rest keep their English defaults.
 *
 * ```ts
 * provideMudTimeLabels(() => {
 *   const i18n = inject(I18nService);
 *   return computed(() => (i18n.lang() === 'ro' ? RO_TIME_LABELS : {}));
 * })
 * ```
 */
export function provideMudTimeLabels(
  labels:
    | Partial<MudTimeLabels>
    | Signal<Partial<MudTimeLabels>>
    | (() => Partial<MudTimeLabels> | Signal<Partial<MudTimeLabels>>),
): Provider {
  const merge = (partial: Partial<MudTimeLabels> | Signal<Partial<MudTimeLabels>>) =>
    isSignal(partial)
      ? computed(() => ({ ...MUD_TIME_LABELS_DEFAULT, ...partial() }))
      : { ...MUD_TIME_LABELS_DEFAULT, ...partial };

  if (typeof labels === 'function' && !isSignal(labels)) {
    return { provide: MUD_TIME_LABELS, useFactory: () => merge(labels()) };
  }

  return { provide: MUD_TIME_LABELS, useValue: merge(labels) };
}
