import { booleanAttribute, computed, Directive, ElementRef, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type EgovLinkStyle = 'primary' | 'strict';
export type EgovLinkSize = 'large' | 'medium' | 'small' | 'extra-small';
export type EgovLinkTouchTarget = 'auto' | 'pointer' | 'touch' | 'none';

const SIZE_CLASSES: Record<EgovLinkSize, string> = {
  large: 'link-lg',
  medium: 'link-md',
  small: 'link-sm',
  'extra-small': 'link-xs',
};

/**
 * ```html
 * <a egovLink href="/services">Services</a>
 * <a egovLink="strict" size="small" [underlined]="false" href="/terms">Terms</a>
 * ```
 */
@Directive({
  selector: 'a[egovLink]',
  exportAs: 'egovLink',
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.tabindex]': "disabled() ? '-1' : null",
  },
})
export class EgovLink {
  private readonly _element = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly egovLink = input.required<EgovLinkStyle, EgovLinkStyle | ''>({
    transform: (value) => value || 'primary',
  });
  readonly size = input<EgovLinkSize>('medium');
  readonly underlined = input(true, { transform: booleanAttribute });
  readonly touchTarget = input<EgovLinkTouchTarget>('auto');
  readonly disabled = input(false, { transform: booleanAttribute });

  // SSR has no media queries; assume fine pointer until the browser hydrates.
  private readonly _coarsePointer =
    this._isBrowser && typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  private readonly _targetClass = computed(() => {
    const target = this.touchTarget();

    if (target === 'none') return null;

    if (target === 'auto') return this._coarsePointer ? 'link-target-touch' : 'link-target-pointer';

    return `link-target-${target}`;
  });

  protected readonly _hostClasses = computed(() => {
    const classes = ['link', `link-${this.egovLink()}`, SIZE_CLASSES[this.size()]];

    classes.push(this.underlined() ? 'link-underline' : 'link-no-underline');

    const targetClass = this._targetClass();

    if (targetClass) classes.push(targetClass);

    return classes.join(' ');
  });

  constructor() {
    // Capture phase so the block runs before any consumer (click) listener.
    this._element.addEventListener(
      'click',
      (event: Event) => {
        if (this.disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true },
    );
  }
}
