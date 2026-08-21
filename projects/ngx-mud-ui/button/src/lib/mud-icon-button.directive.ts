import { afterNextRender, computed, Directive } from '@angular/core';
import { MudButtonBase, isDevMode } from './mud-button-base';

/**
 * Icon-only button: a transparent circle that must be given an accessible
 * name (`aria-label`, `aria-labelledby` or `title`).
 *
 * ```html
 * <button mudIconButton aria-label="Add">
 *   <svg>...</svg>
 * </button>
 * ```
 */
@Directive({
  selector: 'button[mudIconButton], a[mudIconButton]',
  exportAs: 'mudIconButton',
})
export class MudIconButton extends MudButtonBase {
  protected override readonly _hostClasses = computed(() =>
    this.loading() ? 'mud-btn mud-btn-icon mud-btn-loading' : 'mud-btn mud-btn-icon',
  );

  constructor() {
    super();

    if (isDevMode()) {
      afterNextRender(() => {
        const el = this._element;
        const hasName =
          el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') || el.hasAttribute('title');

        if (!hasName) {
          console.warn('mudIconButton: icon buttons must have an accessible name; add an aria-label.', el);
        }
      });
    }
  }
}
