import { DIALOG_DATA } from '@angular/cdk/dialog';
import type { AutoFocusTarget } from '@angular/cdk/dialog';

export type MudDrawerPosition = 'top' | 'right' | 'bottom' | 'left';
export type MudDrawerCloseReason = 'backdrop' | 'escape' | 'action';

export interface MudDrawerCloseResult<R> {
  result: R | undefined;
  reason: MudDrawerCloseReason;
}

export const MUD_DRAWER_DATA = DIALOG_DATA;

/**
 * ```ts
 * this.drawer.open(FiltersComponent, { position: 'left', width: '420px' });
 * ```
 */
export interface MudDrawerConfig<D = unknown> {
  /** @description Payload injected via MUD_DRAWER_DATA. */
  data?: D;
  /** @description Edge the drawer slides in from; default 'right'. */
  position?: MudDrawerPosition;
  /** @description Left/right width (default 382px; any CSS length, % = of the viewport); full screen width at ≤480px. Ignored for top/bottom. */
  width?: string;
  /** @description Top/bottom height (default auto = content height; % = of the viewport). Ignored for left/right. */
  height?: string;
  /** @description Closes on a backdrop click; default true. */
  closeOnBackdrop?: boolean;
  /** @description Closes on Escape; default true. */
  closeOnEscape?: boolean;
  /** @description Accessible name when the drawer has no mudDrawerTitle. */
  ariaLabel?: string;
  /** @description CDK autofocus target passthrough. */
  autoFocus?: AutoFocusTarget | string | boolean;
  /** @description CDK focus-restore passthrough. */
  restoreFocus?: boolean;
  /** @description Escape hatch: extra class(es) merged onto the CDK overlay panel. */
  panelClass?: string | string[];
}
