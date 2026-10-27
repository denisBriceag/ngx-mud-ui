import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import type { DialogRef } from '@angular/cdk/dialog';
import type { MudDialogCloseReason, MudDialogCloseResult } from './mud-dialog-config';
import type { MudDialogContainer } from './mud-dialog-container.component';

/**
 * ```ts
 * const ref = this.dialog.open<boolean>(ConfirmComponent);
 * ref.closed.subscribe(({ result, reason }) => …);
 * ```
 */
export class MudDialogRef<R = unknown> {
  /** @description Emits once with the result and the dismissal reason. */
  readonly closed: Observable<MudDialogCloseResult<R>>;

  /** @description Backdrop clicks, also when closeOnBackdrop is false and they close nothing. */
  readonly backdropClick: Observable<MouseEvent>;

  private _reason: MudDialogCloseReason = 'action';

  constructor(private readonly _cdkRef: DialogRef<R>) {
    this.backdropClick = _cdkRef.backdropClick;
    this.closed = _cdkRef.closed.pipe(map((result) => ({ result, reason: this._reason })));
  }

  /** @description Closes the dialog; omitted reason means a consumer action. */
  close(result?: R, reason: MudDialogCloseReason = 'action'): void {
    this._reason = reason;
    this._cdkRef.close(result);
  }

  /** @docs-private CDK hand-builds the content injector, so directives reach the container through here. */
  get _container(): MudDialogContainer | undefined {
    return this._cdkRef.containerInstance as MudDialogContainer | undefined;
  }
}
