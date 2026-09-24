import { computeSlots } from './pagination-range';
import type { MudPaginationSlot } from './pagination-range';

/** Renders slots the way a person reads them: `1 … 4 5 6 … 20`. */
function show(slots: MudPaginationSlot[]): string {
  return slots.map((slot) => (slot.kind === 'page' ? String(slot.page) : '…')).join(' ');
}

function overflows(slots: MudPaginationSlot[]) {
  return slots.filter((slot): slot is Extract<MudPaginationSlot, { kind: 'overflow' }> => slot.kind === 'overflow');
}

describe('computeSlots', () => {
  it.each([0, 1])('renders nothing for %i page(s)', (pageCount) => {
    expect(computeSlots(1, pageCount, 1)).toEqual([]);
  });

  it.each([2, 3, 4, 5, 6, 7])('shows every page when %i pages fit in 7 slots', (pageCount) => {
    const expected = Array.from({ length: pageCount }, (_v, i) => i + 1).join(' ');

    for (let current = 1; current <= pageCount; current++) {
      expect(show(computeSlots(current, pageCount, 1))).toBe(expected);
    }
  });

  it.each([2, 3, 4, 5])('shows every page when %i pages fit in 5 slots', (pageCount) => {
    const expected = Array.from({ length: pageCount }, (_v, i) => i + 1).join(' ');

    expect(show(computeSlots(1, pageCount, 0))).toBe(expected);
  });

  // Figma: within the first 4 pages only the trailing overflow shows; within the last 4 only
  // the leading one; both once 3+ pages sit on each side of the active page (ends excluded).
  it.each([
    [1, '1 2 3 4 5 … 20'],
    [2, '1 2 3 4 5 … 20'],
    [3, '1 2 3 4 5 … 20'],
    [4, '1 2 3 4 5 … 20'],
    [5, '1 … 4 5 6 … 20'],
    [10, '1 … 9 10 11 … 20'],
    [16, '1 … 15 16 17 … 20'],
    [17, '1 … 16 17 18 19 20'],
    [20, '1 … 16 17 18 19 20'],
  ])('7 slots, page %i of 20 → %s', (current, expected) => {
    expect(show(computeSlots(current, 20, 1))).toBe(expected);
  });

  it.each([
    [1, '1 2 3 4 5 … 8'],
    [4, '1 2 3 4 5 … 8'],
    [5, '1 … 4 5 6 7 8'],
    [8, '1 … 4 5 6 7 8'],
  ])('7 slots, page %i of 8 → %s', (current, expected) => {
    expect(show(computeSlots(current, 8, 1))).toBe(expected);
  });

  it.each([
    [1, '1 2 3 … 10'],
    [3, '1 2 3 … 10'],
    [4, '1 … 4 … 10'],
    [7, '1 … 7 … 10'],
    [8, '1 … 8 9 10'],
    [10, '1 … 8 9 10'],
  ])('5 slots, page %i of 10 → %s', (current, expected) => {
    expect(show(computeSlots(current, 10, 0))).toBe(expected);
  });

  it('never exceeds the slot budget and every overflow hides at least 2 pages', () => {
    for (const siblings of [0, 1] as const) {
      const budget = siblings === 1 ? 7 : 5;

      for (let pageCount = 2; pageCount <= 40; pageCount++) {
        for (let current = 1; current <= pageCount; current++) {
          const slots = computeSlots(current, pageCount, siblings);

          expect(slots.length).toBeLessThanOrEqual(budget);
          for (const overflow of overflows(slots)) expect(overflow.pages.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('covers every page exactly once across numbers and overflows, always showing the current page', () => {
    for (const siblings of [0, 1] as const) {
      for (let pageCount = 2; pageCount <= 40; pageCount++) {
        for (let current = 1; current <= pageCount; current++) {
          const slots = computeSlots(current, pageCount, siblings);
          const covered = slots.flatMap((slot) => (slot.kind === 'page' ? [slot.page] : [...slot.pages]));

          expect(covered).toEqual(Array.from({ length: pageCount }, (_v, i) => i + 1));
          expect(slots).toContainEqual({ kind: 'page', page: current });
        }
      }
    }
  });

  it('keys overflows by side and lists their pages in order', () => {
    const [, leading] = computeSlots(10, 20, 1);
    const trailing = computeSlots(10, 20, 1).at(-2);

    expect(leading).toEqual({ kind: 'overflow', key: 'leading', pages: [2, 3, 4, 5, 6, 7, 8] });
    expect(trailing).toEqual({ kind: 'overflow', key: 'trailing', pages: [12, 13, 14, 15, 16, 17, 18, 19] });
  });

  it('clamps an out-of-range current page instead of throwing', () => {
    expect(show(computeSlots(0, 20, 1))).toBe('1 2 3 4 5 … 20');
    expect(show(computeSlots(99, 20, 1))).toBe('1 … 16 17 18 19 20');
  });
});
