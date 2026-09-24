import { computed, InjectionToken, isSignal } from '@angular/core';
import type { Provider, Signal } from '@angular/core';

/** Every string MudPagination renders; page numbers passed in are 1-based. */
export interface MudPaginationLabels {
  /** Accessible name of the `<nav>` landmark. */
  navigation: string;
  /** Visible label on the Previous button. */
  previous: string;
  /** Visible label on the Next button. */
  next: string;
  /** Accessible name of Previous; receives the 1-based target page. */
  previousAria: (page: number) => string;
  /** Accessible name of Next; receives the 1-based target page. */
  nextAria: (page: number) => string;
  /** Accessible name of a page button; receives its 1-based number and the page count. */
  pageAria: (page: number, total: number) => string;
  /** Accessible name of an overflow `…` button; receives the first and last collapsed page. */
  overflowAria: (from: number, to: number) => string;
}

export const MUD_PAGINATION_LABELS_DEFAULT: MudPaginationLabels = {
  navigation: 'Pagination',
  previous: 'Previous',
  next: 'Next',
  previousAria: (page) => `Previous page, go to page ${page}`,
  nextAria: (page) => `Next page, go to page ${page}`,
  pageAria: (page, total) => `Page ${page} of ${total}`,
  overflowAria: (from, to) => `Show pages ${from} to ${to}`,
};

export const MUD_PAGINATION_LABELS = new InjectionToken<MudPaginationLabels | Signal<MudPaginationLabels>>(
  'MUD_PAGINATION_LABELS',
  { providedIn: 'root', factory: () => MUD_PAGINATION_LABELS_DEFAULT },
);

/**
 * ```ts
 * providers: [provideMudPaginationLabels({ next: 'Următor', previous: 'Anterior' })]
 * ```
 */
export function provideMudPaginationLabels(
  labels:
    | Partial<MudPaginationLabels>
    | Signal<Partial<MudPaginationLabels>>
    | (() => Partial<MudPaginationLabels> | Signal<Partial<MudPaginationLabels>>),
): Provider {
  const merge = (partial: Partial<MudPaginationLabels> | Signal<Partial<MudPaginationLabels>>) =>
    isSignal(partial)
      ? computed(() => ({ ...MUD_PAGINATION_LABELS_DEFAULT, ...partial() }))
      : { ...MUD_PAGINATION_LABELS_DEFAULT, ...partial };

  if (typeof labels === 'function' && !isSignal(labels)) {
    return { provide: MUD_PAGINATION_LABELS, useFactory: () => merge(labels()) };
  }

  return { provide: MUD_PAGINATION_LABELS, useValue: merge(labels) };
}
