import { buildDayGrid, buildYearPage, weekdayOrder, yearPageStart } from './date-grid';

describe('date-grid', () => {
  describe('buildDayGrid', () => {
    // Fixed 6 x 7. A 4-week February must not resize the popover under the
    // user's cursor, so the grid never changes height.
    it('always returns 42 cells', () => {
      expect(buildDayGrid(2026, 2, 1)).toHaveLength(42);
      expect(buildDayGrid(2026, 8, 1)).toHaveLength(42);
      expect(buildDayGrid(2026, 5, 0)).toHaveLength(42);
    });

    it('starts the week on Monday when firstDayOfWeek is 1', () => {
      // 2026-08-01 is a Saturday, so a Monday-first grid opens on Jul 27.
      expect(buildDayGrid(2026, 8, 1)[0]).toEqual({ iso: '2026-07-27', day: 27, outside: true });
    });

    it('starts the week on Sunday when firstDayOfWeek is 0', () => {
      expect(buildDayGrid(2026, 8, 0)[0]).toEqual({ iso: '2026-07-26', day: 26, outside: true });
    });

    it('marks in-month cells as not outside', () => {
      const grid = buildDayGrid(2026, 8, 1);
      const first = grid.find((cell) => cell.iso === '2026-08-01');

      expect(first).toEqual({ iso: '2026-08-01', day: 1, outside: false });
      expect(grid.filter((cell) => !cell.outside)).toHaveLength(31);
    });

    it('produces contiguous days across the whole page', () => {
      const grid = buildDayGrid(2026, 2, 1);

      expect(grid[0].iso).toBe('2026-01-26');
      expect(grid[41].iso).toBe('2026-03-08');
    });

    it('handles a February that starts exactly on the first weekday', () => {
      // 2027-02-01 is a Monday: the leading row belongs to January anyway,
      // because a fixed 6-week grid always shows a full leading week.
      const grid = buildDayGrid(2027, 2, 1);

      expect(grid[0].iso).toBe('2027-02-01');
      expect(grid[0].outside).toBe(false);
    });

    it('spans a leap day', () => {
      const grid = buildDayGrid(2024, 2, 1);

      expect(grid.some((cell) => cell.iso === '2024-02-29' && !cell.outside)).toBe(true);
    });
  });

  describe('weekdayOrder', () => {
    it('rotates the week to the configured start', () => {
      expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
      expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(weekdayOrder(6)).toEqual([6, 0, 1, 2, 3, 4, 5]);
    });
  });

  describe('buildYearPage', () => {
    it('returns 12 page-aligned years, the 4x3 grid upstream specifies', () => {
      const page = buildYearPage(2026);

      expect(page).toHaveLength(12);
      expect(page[0]).toBe(2016);
      expect(page[11]).toBe(2027);
    });

    it('keeps every year in a page on the same page', () => {
      expect(yearPageStart(2016)).toBe(yearPageStart(2027));
      expect(yearPageStart(2028)).toBe(2028);
    });
  });
});
