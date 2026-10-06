import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import type { DialogRef } from '@angular/cdk/dialog';
import type { MudDrawerCloseReason, MudDrawerCloseResult } from './mud-drawer-config';
import type { MudDrawerContainer } from './mud-drawer-container.component';

/**
 * ```ts
 * const ref = this.drawer.open<string>(FiltersComponent);
 * ref.closed.subscribe(({ result, reason }) => …);
 * ```
 */
export class MudDrawerRef<R = unknown> {
  /** @description Emits once with the result and the dismissal reason. */
  readonly closed: Observable<MudDrawerCloseResult<R>>;

  /** @description Backdrop clicks, also when disableClose left them unhandled. */
  readonly backdropClick: Observable<MouseEvent>;

  private _reason: MudDrawerCloseReason = 'action';

  constructor(private readonly _cdkRef: DialogRef<R>) {
    this.backdropClick = _cdkRef.backdropClick;
    this.closed = _cdkRef.closed.pipe(map((result) => ({ result, reason: this._reason })));
  }

  /** @description Closes the drawer; omitted reason means a consumer action. */
  close(result?: R, reason: MudDrawerCloseReason = 'action'): void {
    this._reason = reason;
    this._cdkRef.close(result);
  }

  /** @docs-private Container instance; CDK hand-builds the content injector, so directives reach the container through here. */
  get _container(): MudDrawerContainer | undefined {
    return this._cdkRef.containerInstance as MudDrawerContainer | undefined;
  }
}
