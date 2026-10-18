import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';

export type MudSpinnerSize = 'extra-small' | 'small' | 'medium' | 'large';
export type MudSpinnerVariant = 'brand' | 'dark' | 'light' | 'light-on-color';

/**
 * ```html
 * <mud-spinner />
 * <mud-spinner size="small" variant="light-on-color" aria-label="Se încarcă" />
 * ```
 */
@Component({
  selector: 'mud-spinner',
  template: '<span class="mud-spinner-label">{{ ariaLabel() }}</span>',
  styleUrl: './mud-spinner.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'status',
    '[class]': '_hostClasses()',
    '[attr.aria-label]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSpinner {
  readonly size = input<MudSpinnerSize>('medium');
  readonly variant = input<MudSpinnerVariant>('brand');
  /**
   * Override with a localized label; "Loading" is only a safety default.
   * Rendered as visually-hidden text inside the status region.
   * */
  readonly ariaLabel = input('Loading', { alias: 'aria-label' });

  protected readonly _hostClasses = computed(
    () => `spinner spinner--${this.size()} spinner--${this.variant()}`,
  );
}
