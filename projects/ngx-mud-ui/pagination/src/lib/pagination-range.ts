export type MudPaginationSlot =
  | { readonly kind: 'page'; readonly page: number }
  | { readonly kind: 'overflow'; readonly key: 'leading' | 'trailing'; readonly pages: readonly number[] };

// The first and last page are always shown.
const BOUNDARY = 1;

/** Slots for a 1-based `current` page: siblings 1 → at most 7 slots, siblings 0 → at most 5. */
export function computeSlots(current: number, pageCount: number, siblings: 0 | 1): MudPaginationSlot[] {
  if (pageCount <= 1) return [];

  const total = pageCount;

  if (BOUNDARY * 2 + siblings * 2 + 3 >= total) return range(1, total).map(page);

  const active = Math.min(Math.max(current, 1), total);
  const start = Math.max(Math.min(active - siblings, total - BOUNDARY - siblings * 2 - 1), BOUNDARY + 2);
  const end = Math.min(Math.max(active + siblings, BOUNDARY + siblings * 2 + 2), total - BOUNDARY - 1);

  // An overflow that would hide a single page shows that page's number instead.
  const leading: MudPaginationSlot =
    start > BOUNDARY + 2 ? { kind: 'overflow', key: 'leading', pages: range(BOUNDARY + 1, start - 1) } : page(BOUNDARY + 1);
  const trailing: MudPaginationSlot =
    end < total - BOUNDARY - 1
      ? { kind: 'overflow', key: 'trailing', pages: range(end + 1, total - BOUNDARY) }
      : page(total - BOUNDARY);

  return [...range(1, BOUNDARY).map(page), leading, ...range(start, end).map(page), trailing, ...range(total - BOUNDARY + 1, total).map(page)];
}

function page(value: number): MudPaginationSlot {
  return { kind: 'page', page: value };
}

function range(from: number, to: number): number[] {
  return to < from ? [] : Array.from({ length: to - from + 1 }, (_v, i) => from + i);
}
