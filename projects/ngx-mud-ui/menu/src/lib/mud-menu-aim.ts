/** @docs-private */
export interface MudMenuAimPoint {
  readonly x: number;
  readonly y: number;
}

/** @docs-private */
export type MudMenuAimRect = Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>;

function cross(o: MudMenuAimPoint, a: MudMenuAimPoint, b: MudMenuAimPoint): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * @docs-private True when `to` lies inside the triangle spanned by `from` and the target's near edge
 * (widened by `tolerance` px), i.e. the pointer is heading for the target.
 */
export function isAimingAt(
  from: MudMenuAimPoint,
  to: MudMenuAimPoint,
  target: MudMenuAimRect,
  tolerance = 0,
): boolean {
  let edgeX: number;

  if (target.left >= from.x) edgeX = target.left;
  else if (target.right <= from.x) edgeX = target.right;
  else return false;

  const top = { x: edgeX, y: target.top - tolerance };
  const bottom = { x: edgeX, y: target.bottom + tolerance };
  const d1 = cross(from, top, to);
  const d2 = cross(top, bottom, to);
  const d3 = cross(bottom, from, to);
  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNegative && hasPositive) && d1 !== 0 && d3 !== 0;
}
