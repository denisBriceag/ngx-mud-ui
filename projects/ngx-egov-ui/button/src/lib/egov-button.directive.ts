import { computed, Directive, input } from '@angular/core';
import { EgovButtonBase, isDevMode } from './egov-button-base';

export type EgovButtonVariant = 'filled' | 'outlined' | 'text';
export type EgovButtonColor = 'primary' | 'secondary' | 'strict' | 'neutral' | 'destructive';
export type EgovButtonSize = 'large' | 'medium' | 'small';
export type EgovButtonShape = 'rectangular' | 'circular';

const VARIANT_CLASS_INFIX: Record<EgovButtonVariant, string> = {
  filled: '',
  outlined: '-outline',
  text: '-text',
};

const SIZE_CLASSES: Record<EgovButtonSize, string> = {
  large: '',
  medium: 'mud-btn-md',
  small: 'mud-btn-sm',
};

const SUPPORTED_COLORS: Record<EgovButtonVariant, readonly EgovButtonColor[]> = {
  filled: ['primary', 'secondary', 'strict', 'neutral', 'destructive'],
  outlined: ['primary', 'strict', 'destructive'],
  text: ['primary', 'strict', 'destructive'],
};

/**
 * ```html
 * <button egovButton>Save</button>
 * <button egovButton="outlined" color="destructive" size="small">Delete</button>
 * <a egovButton="text" color="strict" shape="circular" href="/back">Back</a>
 * ```
 */
@Directive({
  selector: 'button[egovButton], a[egovButton]',
  exportAs: 'egovButton',
})
export class EgovButton extends EgovButtonBase {
  readonly egovButton = input.required<EgovButtonVariant, EgovButtonVariant | ''>({
    transform: (value) => value || 'filled',
  });
  readonly color = input<EgovButtonColor>('primary');
  readonly size = input<EgovButtonSize>('large');
  readonly shape = input<EgovButtonShape>('rectangular');

  private readonly _effectiveColor = computed(() => {
    const variant = this.egovButton();
    const color = this.color();

    if (!SUPPORTED_COLORS[variant].includes(color)) {
      if (isDevMode()) {
        console.warn(
          `egovButton: color "${color}" is not supported by the "${variant}" variant; falling back to "primary". ` +
            `Supported colors: ${SUPPORTED_COLORS[variant].join(', ')}.`,
        );
      }

      return 'primary';
    }

    return color;
  });

  protected override readonly _hostClasses = computed(() => {
    const classes = ['mud-btn', `mud-btn${VARIANT_CLASS_INFIX[this.egovButton()]}-${this._effectiveColor()}`];
    const sizeClass = SIZE_CLASSES[this.size()];

    if (sizeClass) classes.push(sizeClass);

    if (this.shape() === 'circular') classes.push('mud-btn-rounded');

    if (this.loading()) classes.push('mud-btn-loading');

    return classes.join(' ');
  });
}
