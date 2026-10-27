import { afterNextRender, computed, Directive, input } from '@angular/core';
import { MudButtonBase } from './mud-button-base';

declare const ngDevMode: boolean | undefined;

export type MudIconButtonSize = 'medium' | 'small';

/**
 * ```html
 * <button mudIconButton aria-label="Add">
 *   <svg>...</svg>
 * </button>
 * <button mudIconButton size="small" aria-label="Edit"><mud-icon name="edit" [scale]="16" /></button>
 * ```
 */
@Directive({
  selector: 'button[mudIconButton], a[mudIconButton]',
  exportAs: 'mudIconButton',
})
export class MudIconButton extends MudButtonBase {
  /** @description Circle size: 'medium' 40px or 'small' 32px. */
  readonly size = input<MudIconButtonSize>('medium');

  protected override readonly _hostClasses = computed(() => {
    const classes = ['mud-btn', 'mud-btn-icon'];

    if (this.size() === 'small') classes.push('mud-btn-sm');

    if (this.loading()) classes.push('mud-btn-loading');

    return classes.join(' ');
  });

  constructor() {
    super();

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
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
