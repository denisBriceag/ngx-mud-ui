import { isAimingAt } from '../mud-menu-aim';

describe('isAimingAt', () => {
  // Submenu to the right of a 200px-wide parent, spanning y 100..300.
  const right = { left: 200, right: 400, top: 100, bottom: 300 };
  const left = { left: -200, right: 0, top: 100, bottom: 300 };

  it('is true for a diagonal move towards the far corner of a right-hand submenu', () => {
    expect(isAimingAt({ x: 100, y: 110 }, { x: 120, y: 130 }, right)).toBe(true);
  });

  it('is false for a mostly vertical move that leaves the triangle', () => {
    expect(isAimingAt({ x: 100, y: 110 }, { x: 102, y: 160 }, right)).toBe(false);
  });

  it('is false when moving away from the submenu', () => {
    expect(isAimingAt({ x: 100, y: 110 }, { x: 80, y: 130 }, right)).toBe(false);
  });

  it('is false when the pointer has not moved', () => {
    expect(isAimingAt({ x: 100, y: 110 }, { x: 100, y: 110 }, right)).toBe(false);
  });

  it('mirrors for a submenu opened on the left', () => {
    expect(isAimingAt({ x: 100, y: 110 }, { x: 80, y: 130 }, left)).toBe(true);
    expect(isAimingAt({ x: 100, y: 110 }, { x: 120, y: 130 }, left)).toBe(false);
  });

  it('is false when the start point overlaps the submenu horizontally', () => {
    expect(isAimingAt({ x: 250, y: 50 }, { x: 260, y: 120 }, right)).toBe(false);
  });

  it('tolerance widens the triangle beyond the submenu edge', () => {
    const from = { x: 100, y: 110 };
    const to = { x: 150, y: 80 };

    expect(isAimingAt(from, to, right)).toBe(false);
    expect(isAimingAt(from, to, right, 75)).toBe(true);
  });
});
