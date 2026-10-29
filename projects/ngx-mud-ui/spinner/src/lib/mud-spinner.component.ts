import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';

export type MudSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
export type MudSpinnerVariant = 'brand' | 'dark' | 'light' | 'light-on-color';

/**
 * ```html
 * <mud-spinner />
 * <mud-spinner size="sm" variant="light-on-color" aria-label="Se încarcă" />
 * ```
 */
@Component({
  selector: 'mud-spinner',
  template: '<span class="mud-spinner-label">{{ _label() }}</span>',
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
  /** @description Diameter: 16, 20, 32 or 40px. */
  readonly size = input<MudSpinnerSize>('md');
  /** @description Color; `light-on-color` is for saturated backgrounds. */
  readonly variant = input<MudSpinnerVariant>('brand');
  /** @description Visually-hidden status text; defaults to the app labels (`spinner.loading`). */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  private readonly _labels = injectMudLabels();

  protected readonly _label = computed(() => _mudText(this.ariaLabel(), this._labels().spinner.loading));

  protected readonly _hostClasses = computed(
    () => `spinner spinner--${this.size()} spinner--${this.variant()}`,
  );
}
