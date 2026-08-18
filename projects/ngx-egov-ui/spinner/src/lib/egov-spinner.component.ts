import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type EgovSpinnerSize = 'extra-small' | 'small' | 'medium' | 'large';
export type EgovSpinnerVariant = 'brand' | 'dark' | 'light' | 'light-on-color';

/**
 * ```html
 * <egov-spinner />
 * <egov-spinner size="small" variant="light-on-color" aria-label="Se încarcă" />
 * ```
 */
@Component({
  selector: 'egov-spinner',
  template: '<span class="egov-spinner-label">{{ ariaLabel() }}</span>',
  host: {
    role: 'status',
    '[class]': '_hostClasses()',
    '[attr.aria-label]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovSpinner {
  readonly size = input<EgovSpinnerSize>('medium');
  readonly variant = input<EgovSpinnerVariant>('brand');
  /**
   * Override with a localized label; "Loading" is only a safety default.
   * Rendered as visually-hidden text inside the status region.
   * */
  readonly ariaLabel = input('Loading', { alias: 'aria-label' });

  protected readonly _hostClasses = computed(
    () => `spinner spinner--${this.size()} spinner--${this.variant()}`,
  );
}
