import type { TemplateRef } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import type { DialogRef } from '@angular/cdk/dialog';
import { hasModifierKey } from '@angular/cdk/keycodes';
import type { ComponentType } from '@angular/cdk/portal';
import { MudDialogRef } from './mud-dialog-ref';
import { MudDialogContainer } from './mud-dialog-container.component';
import type { MudDialogConfig } from './mud-dialog-config';

/**
 * ```ts
 * private readonly dialog = inject(MudDialog);
 * const ref = this.dialog.open(ConfirmComponent, { data: { id } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MudDialog {
  private readonly _cdkDialog = inject(Dialog);

  /** @description Opens a component or template as a modal dialog. */
  open<R = unknown, D = unknown>(
    componentOrTemplate: ComponentType<unknown> | TemplateRef<unknown>,
    config: MudDialogConfig<D> = {},
  ): MudDialogRef<R> {
    // CDK invokes `providers` synchronously — with the real DialogRef already
    // built, before attaching the component, so the instance created here is
    // exactly the one both the opened component and this method return.
    let mudRef!: MudDialogRef<R>;

    this._cdkDialog.open<R, D>(componentOrTemplate, {
      container: MudDialogContainer,
      data: config.data,
      ariaLabel: config.ariaLabel ?? null,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      restoreFocus: config.restoreFocus ?? true,
      panelClass: [
        'mud-dialog-panel',
        ...(Array.isArray(config.panelClass) ? config.panelClass : config.panelClass ? [config.panelClass] : []),
      ],
      backdropClass: 'mud-dialog-backdrop',
      disableClose: true,
      providers: (dialogRef: DialogRef<R>) => {
        mudRef = new MudDialogRef<R>(dialogRef);

        if (config.closeOnBackdrop ?? true) {
          dialogRef.backdropClick.subscribe(() => mudRef.close(undefined, 'backdrop'));
        }

        if (config.closeOnEscape ?? true) {
          dialogRef.keydownEvents.subscribe((event) => {
            // Parity with CdkDialog's own ESC handling: modified Escape (e.g.
            // Shift+Escape, a screen-reader chord) is not a dismissal.
            if (event.key === 'Escape' && !hasModifierKey(event) && !event.defaultPrevented) {
              event.preventDefault();
              mudRef.close(undefined, 'escape');
            }
          });
        }

        return [{ provide: MudDialogRef, useValue: mudRef }];
      },
      ...({
        size: config.size ?? 'md',
        showCloseButton: config.showCloseButton ?? true,
        closeLabel: config.closeLabel?.trim() || 'Close',
        mudRefFactory: () => mudRef,
      } as object),
    });

    return mudRef;
  }
}
