import type { ConnectedPosition } from '@angular/cdk/overlay';

export const MUD_TOOLTIP_PLACEMENTS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
  'left-top',
  'left-center',
  'left-bottom',
  'right-top',
  'right-center',
  'right-bottom',
] as const;

export type MudTooltipPlacement = (typeof MUD_TOOLTIP_PLACEMENTS)[number];

export type MudTooltipSize = 'small' | 'large';

const CONNECTED_POSITIONS: Record<MudTooltipPlacement, ConnectedPosition> = {
  'top-left': { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  'top-center': { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
  'top-right': { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom' },
  'bottom-left': { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  'bottom-center': { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
  'bottom-right': { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' },
  'left-top': { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top' },
  'left-center': { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
  'left-bottom': { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom' },
  'right-top': { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
  'right-center': { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
  'right-bottom': { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom' },
};

const FLIPPED_SIDE: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export interface MudTooltipConnectedPosition {
  placement: MudTooltipPlacement;
  position: ConnectedPosition;
}

/**
 * @description Preferred position for a placement followed by its viewport fallbacks:
 * the flipped side first (same alignment), then the remaining alignments on
 * the preferred and flipped sides — mirroring the design-system behavior of
 * shifting the arrow when the related element sits near a viewport edge.
 */
export function connectedPositionsFor(placement: MudTooltipPlacement): MudTooltipConnectedPosition[] {
  const [side] = placement.split('-');
  const flippedSide = FLIPPED_SIDE[side];
  const seen = new Set<string>();
  const order = [
    placement,
    placement.replace(side, flippedSide),
    ...MUD_TOOLTIP_PLACEMENTS.filter((p) => p.startsWith(`${side}-`)),
    ...MUD_TOOLTIP_PLACEMENTS.filter((p) => p.startsWith(`${flippedSide}-`)),
  ];

  return order
    .filter((p): p is MudTooltipPlacement => !seen.has(p) && !!seen.add(p))
    .map((p) => ({ placement: p, position: CONNECTED_POSITIONS[p] }));
}
