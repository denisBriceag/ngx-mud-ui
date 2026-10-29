import { booleanAttribute, computed, Directive, ElementRef, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudLinkStyles } from './mud-link-styles.component';

export type MudLinkStyle = 'primary' | 'strict';
export type MudLinkSize = 'xs' | 'sm' | 'md' | 'lg';
export type MudLinkUnderline = 'always' | 'hover' | 'none';
export type MudLinkTouchTarget = 'auto' | 'pointer' | 'touch' | 'none';

const SIZE_CLASSES: Record<MudLinkSize, string> = {
  lg: 'link-lg',
  md: 'link-md',
  sm: 'link-sm',
  xs: 'link-xs',
};

const UNDERLINE_CLASSES: Record<MudLinkUnderline, string> = {
  always: 'link-underline',
  hover: 'link-underline-hover',
  none: 'link-no-underline',
};

/**
 * ```html
 * <a mudLink href="/services">Services</a>
 * <a mudLink="strict" size="sm" underline="none" href="/terms">Terms</a>
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

  /** @description Color: `primary` (brand, default; also an empty attribute) or `strict` (text color). */
  readonly mudLink = input.required<MudLinkStyle, MudLinkStyle | ''>({
    transform: (value) => value || 'primary',
  });
  /** @description Text size. */
  readonly size = input<MudLinkSize>('md');
  /** @description When the underline shows. */
  readonly underline = input<MudLinkUnderline>('always');
  /** @description Invisible hit area: `pointer` 32px, `touch` 40px, `auto` picks by device, `none` keeps the text box (for links in running text). */
  readonly touchTarget = input<MudLinkTouchTarget>('auto');
  /** @description Sets `aria-disabled`, removes the link from the tab order and blocks activation. */
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
