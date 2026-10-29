export type MudPaginationSize = 'sm' | 'md';

/** Emitted by `(page)`; indexes are 0-based. */
export interface MudPageEvent {
  pageIndex: number;
  previousPageIndex: number;
  pageSize: number;
  length: number;
}
