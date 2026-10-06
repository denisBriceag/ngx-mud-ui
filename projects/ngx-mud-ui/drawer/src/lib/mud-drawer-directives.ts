import { Directive, DestroyRef, inject, input } from '@angular/core';
import { MudDrawerRef } from './mud-drawer-ref';

let nextDrawerTitleId = 0;

/**
 * ```html
 * <h2 mudDrawerTitle>Filtre</h2>
 * ```
 */
@Directive({ selector: '[mudDrawerTitle]', host: { '[id]': '_id' } })
export class MudDrawerTitle {
  /** @docs-private */
  protected readonly _id = `mud-drawer-title-${nextDrawerTitleId++}`;
  private readonly _ref = inject(MudDrawerRef, { optional: true });

  constructor() {
    this._ref?._container?._addAriaLabelledBy(this._id);

    inject(DestroyRef).onDestroy(() => this._ref?._container?._removeAriaLabelledBy(this._id));
  }
}

/**
 * ```html
 * <button mudIconButton aria-label="Închide" mudDrawerClose>…</button>
 * <button mudButton [mudDrawerClose]="filters">Aplică</button>
 * ```
 */
@Directive({
  selector: '[mudDrawerClose]',
  host: { '[attr.type]': 'type()', '(click)': '_close()' },
})
export class MudDrawerClose<R = unknown> {
  /** @description Result emitted through MudDrawerRef.closed; a bare attribute means undefined. */
  readonly mudDrawerClose = input<R | undefined, R | '' | undefined>(undefined, {
    transform: (value) => (value === '' ? undefined : value),
  });

  readonly type = input('button');

  private readonly _ref = inject(MudDrawerRef) as MudDrawerRef<R>;

  protected _close(): void {
    this._ref.close(this.mudDrawerClose(), 'action');
  }
}
