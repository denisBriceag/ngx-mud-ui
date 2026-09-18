import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import type { MudToastDismissReason } from './mud-toast-config';

/**
 * ```ts
 * const ref = toast.open({ data: { message: 'Salvat' } });
 * ref.dismissed.subscribe((reason) => console.log(reason));
 * ```
 */
export class MudToastRef<T = void> {
  /** @description Component instance from openFromComponent; set once `opened` emits, undefined while queued. */
  instance?: T;

  private readonly _opened = new Subject<void>();
  private readonly _dismissed = new Subject<MudToastDismissReason>();
  private readonly _dismissRequest = new Subject<MudToastDismissReason>();
  // Defensive: RxJS already stops completed Subjects; this flag ensures future non-Subject side effects stay idempotent.
  private _settled = false;

  /** @description Emits after the enter animation, then completes. */
  readonly opened: Observable<void> = this._opened.asObservable();

  /** @description Emits the dismiss reason once, then completes. */
  readonly dismissed: Observable<MudToastDismissReason> = this._dismissed.asObservable();

  /** @internal Dismiss requests the service listens to. */
  readonly _dismissRequests: Observable<MudToastDismissReason> = this._dismissRequest.asObservable();

  /** @description Dismisses the toast. Queued toasts are dropped without rendering. */
  dismiss(reason: MudToastDismissReason = 'action'): void {
    if (this._settled) return;

    this._dismissRequest.next(reason);
  }

  /** @internal No _settled guard: service calls this only before settle, and Subject.complete() is idempotent. */
  _markOpened(): void {
    this._opened.next();
    this._opened.complete();
  }

  /** @internal Terminal: emits the reason, completes every stream. */
  _settle(reason: MudToastDismissReason): void {
    if (this._settled) return;

    this._settled = true;
    this._opened.complete();
    this._dismissed.next(reason);
    this._dismissed.complete();
    this._dismissRequest.complete();
  }

  /** @internal Ref returned on the server, where no toast is ever rendered. */
  static inert<T = void>(): MudToastRef<T> {
    const ref = new MudToastRef<T>();

    ref._settled = true;
    ref._opened.complete();
    ref._dismissed.complete();
    ref._dismissRequest.complete();

    return ref;
  }
}
