import { Directive, DestroyRef, computed, inject, input } from '@angular/core';
import { MudDialogRef } from './mud-dialog-ref';

let nextDialogTitleId = 0;

/**
 * ```html
 * <h2 mudDialogTitle>Sigur ștergeți?</h2>
 * ```
 */
@Directive({
  selector: '[mudDialogTitle]',
  host: { class: 'dialog__title', '[id]': '_id' },
})
export class MudDialogTitle {
  /** @docs-private */
  protected readonly _id = `mud-dialog-title-${nextDialogTitleId++}`;
  private readonly _ref = inject(MudDialogRef, { optional: true });

  constructor() {
    this._ref?._container?._addAriaLabelledBy(this._id);

    inject(DestroyRef).onDestroy(() => this._ref?._container?._removeAriaLabelledBy(this._id));
  }
}

/** The scroll region between title and actions. */
@Directive({ selector: '[mudDialogContent]', host: { class: 'dialog__content' } })
export class MudDialogContent {}

/** Footer action row; stacks on mobile, or always via layout="stacked". */
@Directive({
  selector: '[mudDialogActions]',
  host: { '[class]': '_classes()' },
})
export class MudDialogActions {
  /** @description inline (default) or stacked full-width buttons, primary on top. */
  readonly layout = input<'inline' | 'stacked'>('inline');

  /** @docs-private */
  protected readonly _classes = computed(() =>
    this.layout() === 'stacked' ? 'dialog__actions dialog__actions--stacked' : 'dialog__actions',
  );
}

/**
 * ```html
 * <button mudButton [mudDialogClose]="true">Șterge</button>
 * ```
 */
@Directive({
  selector: '[mudDialogClose]',
  host: { '[attr.type]': 'type()', '(click)': '_close()' },
})
export class MudDialogClose<R = unknown> {
  /** @description Result emitted through MudDialogRef.closed. */
  readonly mudDialogClose = input<R | undefined>(undefined);

  /** @description Native button `type`; defaults to `'button'`. */
  readonly type = input('button');

  private readonly _ref = inject(MudDialogRef) as MudDialogRef<R>;

  /** @docs-private */
  protected _close(): void {
    this._ref.close(this.mudDialogClose(), 'action');
  }
}

@Directive({ selector: '[mudDialogImage]', host: { class: 'dialog__image' } })
export class MudDialogImage {}
