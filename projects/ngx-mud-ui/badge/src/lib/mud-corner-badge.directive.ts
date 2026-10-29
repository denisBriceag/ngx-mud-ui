import { computed, Directive, effect, ElementRef, inject, input, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudFormatLocale } from 'ngx-mud-ui/i18n';
import { _MudBadgeStyles } from './mud-badge-styles.component';
import type { MudBadgeSize, MudBadgeType, MudBadgeVariant } from './mud-badge.types';

export type MudBadgePosition =
  | 'above after'
  | 'above before'
  | 'below before'
  | 'below after'
  | 'before'
  | 'after'
  | 'above'
  | 'below';

let nextId = 0;

declare const ngDevMode: boolean | undefined;

/**
 * @description Badge pinned to a corner of its host. For an inline badge use `<mud-badge>`.
 * ```html
 * <button mudButton mudBadge="5" badgeVariant="danger">Inbox</button>
 * ```
 */
@Directive({
  selector: '[mudBadge]',
  exportAs: 'mudBadge',
  host: { class: 'mud-badge-host' },
})
export class MudCornerBadge {
  private readonly _renderer = inject(Renderer2);
  private readonly _host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _descriptionId = `mud-badge-description-${nextId++}`;

  /** @description Badge content, usually a count. `null` removes the badge. */
  readonly mudBadge = input<string | number | null>(null);
  /** @description Size; `xs` is dot-only. */
  readonly badgeSize = input<MudBadgeSize>('md');
  /** @description Color variant. */
  readonly badgeVariant = input<MudBadgeVariant>('danger');
  /** @description Corner of the host; a single keyword fills in the other axis (`before` = `above before`). */
  readonly badgePosition = input<MudBadgePosition>('above after');
  /** @description Numeric content above this renders as `{max}+`; `null` never truncates. */
  readonly badgeMax = input<number | null, number | string | null | undefined>(null, {
    transform: (value) => {
      if (value == null || value === '') return null;

      const parsed = Number(value);

      if (Number.isNaN(parsed)) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          console.warn(`mudBadge: badgeMax "${value}" is not a number; the badge count will not be truncated.`);
        }

        return null;
      }

      return parsed;
    },
  });
  /** @description `numbered` shows the content, `dot` ignores it. */
  readonly badgeType = input<MudBadgeType>('numbered');
  /** @description What the badge means ("5 unread messages"). Describes the host via `aria-describedby` and hides the visual badge from screen readers. */
  readonly badgeDescription = input<string | null>(null);

  private _badge: HTMLElement | null = null;
  private _description: HTMLElement | null = null;

  private readonly _effectiveType = computed<MudBadgeType>(() => {
    if (this.badgeType() === 'numbered' && this.badgeSize() === 'xs') {
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        console.warn(
          'mudBadge: size "xs" is dot-only; rendering a dot instead of the count. ' +
            'Use badgeDescription to announce the count, or size "sm" and up to display it.',
        );
      }

      return 'dot';
    }

    return this.badgeType();
  });

  private readonly _formatLocale = injectMudFormatLocale();
  private readonly _numberFormat = computed(() => new Intl.NumberFormat(this._formatLocale(), { useGrouping: false }));

  private readonly _content = computed<string | null>(() => {
    if (this._effectiveType() === 'dot') return '';

    const value = this.mudBadge();

    if (value == null || value === '') return null;

    const max = this.badgeMax();
    const count = typeof value === 'number' ? value : Number(value);

    const format = this._numberFormat();

    if (max != null && Number.isFinite(count) && count > max) return `${format.format(max)}+`;

    // Integers (numbers or canonical integer strings) get locale digits; anything else is shown as given.
    if ((typeof value === 'number' && Number.isInteger(value)) || /^(0|[1-9]\d*)$/.test(`${value}`)) {
      return format.format(Number(value));
    }

    return `${value}`;
  });

  private readonly _badgeClasses = computed(() => {
    const position = this.badgePosition();
    const classes = [
      'badge',
      `badge--${this.badgeSize()}`,
      `badge--solid-${this.badgeVariant()}`,
      'badge--fixed',
      position.includes('below') ? 'badge--below' : 'badge--above',
      position.includes('before') ? 'badge--before' : 'badge--after',
    ];

    if (this._effectiveType() === 'dot') classes.push('badge--dot');

    return classes.join(' ');
  });

  constructor() {
    inject(MudStyleLoader).load(_MudBadgeStyles);

    // Browser-only: an imperatively created span can't be claimed by hydration and would duplicate.
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    effect(() => {
      const content = this._content();

      if (content === null) {
        this._detachBadge();
        this._detachDescription();

        return;
      }

      const badge = this._badge ?? this._attachBadge();

      this._renderer.setAttribute(badge, 'class', this._badgeClasses());
      this._renderer.setProperty(badge, 'textContent', content);

      const description = this.badgeDescription();

      if (description) {
        const element = this._description ?? this._attachDescription();

        this._renderer.setProperty(element, 'textContent', description);
        this._renderer.setAttribute(badge, 'aria-hidden', 'true');
      } else {
        this._detachDescription();
        this._renderer.removeAttribute(badge, 'aria-hidden');
      }
    });
  }

  private _attachBadge(): HTMLElement {
    const badge = this._renderer.createElement('span') as HTMLElement;

    this._renderer.appendChild(this._host, badge);
    this._badge = badge;

    return badge;
  }

  private _detachBadge(): void {
    if (!this._badge) return;

    this._renderer.removeChild(this._host, this._badge);
    this._badge = null;
  }

  private _attachDescription(): HTMLElement {
    const element = this._renderer.createElement('span') as HTMLElement;

    this._renderer.setAttribute(element, 'id', this._descriptionId);
    this._renderer.setAttribute(element, 'class', 'mud-badge-description');
    // Polite live region so a changing description (e.g. unread count) is announced.
    this._renderer.setAttribute(element, 'role', 'status');
    this._renderer.setAttribute(element, 'aria-live', 'polite');
    this._renderer.appendChild(this._host, element);
    this._description = element;

    const ids = this._describedByIds();

    if (!ids.includes(this._descriptionId)) ids.push(this._descriptionId);

    this._renderer.setAttribute(this._host, 'aria-describedby', ids.join(' '));

    return element;
  }

  private _detachDescription(): void {
    if (!this._description) return;

    this._renderer.removeChild(this._host, this._description);
    this._description = null;

    const ids = this._describedByIds().filter((id) => id !== this._descriptionId);

    if (ids.length) {
      this._renderer.setAttribute(this._host, 'aria-describedby', ids.join(' '));
    } else {
      this._renderer.removeAttribute(this._host, 'aria-describedby');
    }
  }

  private _describedByIds(): string[] {
    const value = this._host.getAttribute('aria-describedby');

    return value ? value.split(/\s+/).filter(Boolean) : [];
  }
}
