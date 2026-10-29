import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { MudButtonBase } from './mud-button-base';

declare const ngDevMode: boolean | undefined;

export type MudButtonVariant = 'filled' | 'outlined' | 'text';
export type MudButtonColor = 'primary' | 'secondary' | 'strict' | 'neutral' | 'destructive';
export type MudButtonSize = 'sm' | 'md' | 'lg';
export type MudButtonShape = 'rectangular' | 'circular';

const VARIANT_CLASS_INFIX: Record<MudButtonVariant, string> = {
  filled: '',
  outlined: '-outline',
  text: '-text',
};

const SIZE_CLASSES: Record<MudButtonSize, string> = {
  lg: '',
  md: 'mud-btn-md',
  sm: 'mud-btn-sm',
};

const SUPPORTED_COLORS: Record<MudButtonVariant, readonly MudButtonColor[]> = {
  filled: ['primary', 'secondary', 'strict', 'neutral', 'destructive'],
  outlined: ['primary', 'strict', 'destructive'],
  text: ['primary', 'strict', 'destructive'],
};

/**
 * ```html
 * <button mudButton>Save</button>
 * <button mudButton="outlined" color="destructive" size="sm">Delete</button>
 * <a mudButton="text" color="strict" shape="circular" href="/back">Back</a>
 * ```
 */
@Directive({
  selector: 'button[mudButton], a[mudButton]',
  exportAs: 'mudButton',
})
export class MudButton extends MudButtonBase {
  /** @description Visual variant; an empty attribute (`<button mudButton>`) means `filled`. */
  readonly mudButton = input.required<MudButtonVariant, MudButtonVariant | ''>({
    transform: (value) => value || 'filled',
  });
  /** @description Color; `secondary` and `neutral` exist for the `filled` variant only. */
  readonly color = input<MudButtonColor>('primary');
  /** @description Height and padding. */
  readonly size = input<MudButtonSize>('lg');
  /** @description Corner style; `circular` rounds the ends fully. */
  readonly shape = input<MudButtonShape>('rectangular');
  /** @description Stretches the button to fill its container's width. */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  private readonly _effectiveColor = computed(() => {
    const variant = this.mudButton();
    const color = this.color();

    if (!SUPPORTED_COLORS[variant].includes(color)) {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          `mudButton: color "${color}" is not supported by the "${variant}" variant; falling back to "primary". ` +
            `Supported colors: ${SUPPORTED_COLORS[variant].join(', ')}.`,
        );
      }

      return 'primary';
    }

    return color;
  });

  protected override readonly _hostClasses = computed(() => {
    const classes = ['mud-btn', `mud-btn${VARIANT_CLASS_INFIX[this.mudButton()]}-${this._effectiveColor()}`];
    const sizeClass = SIZE_CLASSES[this.size()];

    if (sizeClass) classes.push(sizeClass);

    if (this.shape() === 'circular') classes.push('mud-btn-rounded');

    if (this.fullWidth()) classes.push('mud-btn-full');

    if (this.loading()) classes.push('mud-btn-loading');

    return classes.join(' ');
  });
}
