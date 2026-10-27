import { booleanAttribute, computed, Directive, ElementRef, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudLinkStyles } from './mud-link-styles.component';

export type MudLinkStyle = 'primary' | 'strict';
export type MudLinkSize = 'large' | 'medium' | 'small' | 'extra-small';
export type MudLinkUnderline = 'always' | 'hover' | 'none';
export type MudLinkTouchTarget = 'auto' | 'pointer' | 'touch' | 'none';

const SIZE_CLASSES: Record<MudLinkSize, string> = {
  large: 'link-lg',
  medium: 'link-md',
  small: 'link-sm',
  'extra-small': 'link-xs',
};

const UNDERLINE_CLASSES: Record<MudLinkUnderline, string> = {
  always: 'link-underline',
  hover: 'link-underline-hover',
  none: 'link-no-underline',
};

/**
 * ```html
 * <a mudLink href="/services">Services</a>
 * <a mudLink="strict" size="small" underline="none" href="/terms">Terms</a>
 * <a mudLink href="https://gov.md" target="_blank">Portal</a> <!-- auto external icon + rel -->
 * ```
 */
@Directive({
  selector: 'a[mudLink]',
  exportAs: 'mudLink',
  host: {
    '[class]': '_hostClasses()',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.tabindex]': "disabled() ? '-1' : null",
  },
})
export class MudLink {
  private readonly _element = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mudLink = input.required<MudLinkStyle, MudLinkStyle | ''>({
    transform: (value) => value || 'primary',
  });
  readonly size = input<MudLinkSize>('medium');
  readonly underline = input<MudLinkUnderline>('always');
  readonly touchTarget = input<MudLinkTouchTarget>('auto');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Shows the external-link glyph on `target="_blank"` anchors with no trailing icon. */
  readonly external = input(true, { transform: booleanAttribute });

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
    const classes = ['link', `link-${this.mudLink()}`, SIZE_CLASSES[this.size()]];

    classes.push(UNDERLINE_CLASSES[this.underline()]);

    if (this.external()) classes.push('link-external');

    const targetClass = this._targetClass();

    if (targetClass) classes.push(targetClass);

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudLinkStyles);

    // New-tab anchors get a safety rel unless the consumer set one.
    const anchor = this._element as HTMLAnchorElement;

    if (anchor.getAttribute?.('target') === '_blank' && !anchor.getAttribute('rel')) {
      anchor.setAttribute('rel', 'noopener noreferrer');
    }

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
