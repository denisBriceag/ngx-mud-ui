import { DIALOG_DATA } from '@angular/cdk/dialog';
import type { AutoFocusTarget } from '@angular/cdk/dialog';

export type MudDialogSize = 'sm' | 'md' | 'lg';
export type MudDialogCloseReason = 'backdrop' | 'escape' | 'close-button' | 'action';

export interface MudDialogCloseResult<R> {
  result: R | undefined;
  reason: MudDialogCloseReason;
}

/** Injection token delivering `MudDialogConfig.data` to the opened component. */
export const MUD_DIALOG_DATA = DIALOG_DATA;

/**
 * ```ts
 * this.dialog.open(ConfirmComponent, { data: { id }, size: 'sm', disableClose: true });
 * ```
 */
export interface MudDialogConfig<D = unknown> {
  /** @description Payload injected via MUD_DIALOG_DATA. */
  data?: D;
  /** @description Width rung: sm 480px, md 588px (default), lg 720px. Mobile is always min(350px, 100vw - 32px). */
  size?: MudDialogSize;
  /** @description Renders the container-owned close (×) button. */
  showCloseButton?: boolean;
  /** @description Accessible name of the close button. Localize per app. */
  closeLabel?: string;
  /** @description Suppresses backdrop-click AND Escape dismissal. */
  disableClose?: boolean;
  /** @description Accessible name when the dialog has no mudDialogTitle. */
  ariaLabel?: string;
  /** @description CDK autofocus target passthrough. */
  autoFocus?: AutoFocusTarget | string | boolean;
  /** @description CDK focus-restore passthrough. */
  restoreFocus?: boolean;
  /** @description Escape hatch: extra class(es) merged onto the CDK overlay panel. */
  panelClass?: string | string[];
}
