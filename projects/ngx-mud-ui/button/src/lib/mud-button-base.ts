import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import type { Signal } from '@angular/core';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudButtonStyles } from './mud-button-styles.component';

/**
 * Shared behavior for mudButton/mudIconButton: disabled semantics for
 * buttons and anchors, and the loading state with its accessibility contract.
 */
@Directive({
  host: {
    '[class]': '_hostClasses()',
    '[attr.disabled]': '_nativeDisabled()',
    '[attr.aria-disabled]': '_ariaDisabled()',
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.tabindex]': '_tabIndex()',
  },
})
export abstract class MudButtonBase {
  protected readonly _element = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly _isAnchor = this._element.tagName === 'A';

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  protected abstract readonly _hostClasses: Signal<string>;

  // Anchors can't be natively disabled; loading must not drop focus mid-action.
  protected readonly _nativeDisabled = computed(() => (!this._isAnchor && this.disabled() ? '' : null));

  protected readonly _ariaDisabled = computed(() =>
    this.loading() || (this._isAnchor && this.disabled()) ? 'true' : null,
  );

  protected readonly _tabIndex = computed(() => (this._isAnchor && this.disabled() ? '-1' : null));

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudButtonStyles);

    // Capture phase so the block runs before any consumer (click) listener.
    this._element.addEventListener(
      'click',
      (event: Event) => {
        if (this.disabled() || this.loading()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
}
