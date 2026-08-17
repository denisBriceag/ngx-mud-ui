import { computed, Directive, effect, ElementRef, inject, input, Renderer2 } from '@angular/core';

export type EgovBadgeSize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
export type EgovBadgeColor = 'dark' | 'light' | 'neutral' | 'accent' | 'danger';
export type EgovBadgePosition =
  | 'above after'
  | 'above before'
  | 'below before'
  | 'below after'
  | 'before'
  | 'after'
  | 'above'
  | 'below';
export type EgovBadgeVariant = 'count' | 'dot';

const SIZE_CLASSES: Record<EgovBadgeSize, string> = {
  'extra-small': 'badge--xs',
  small: 'badge--sm',
  medium: 'badge--md',
  large: 'badge--lg',
  'extra-large': 'badge--xl',
};

let nextId = 0;

declare const ngDevMode: boolean | undefined;

const isDevMode = (): boolean => typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * ```html
 * <button egovButton egovBadge="5" badgeColor="danger">Inbox</button>
 * ```
 */
@Directive({
  selector: '[egovBadge]',
  exportAs: 'egovBadge',
  host: { class: 'egov-badge-host' },
})
export class EgovBadge {
  private readonly _renderer = inject(Renderer2);
  private readonly _host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly _descriptionId = `egov-badge-description-${nextId++}`;

  readonly egovBadge = input<string | number | null>(null);
  readonly badgeSize = input<EgovBadgeSize>('medium');
  readonly badgeColor = input<EgovBadgeColor>('neutral');
  readonly badgePosition = input<EgovBadgePosition>('above after');
  readonly badgeMax = input<number | null, number | string | null | undefined>(null, {
    transform: (value) => (value == null || value === '' ? null : Number(value)),
  });
  readonly badgeVariant = input<EgovBadgeVariant>('count');
  readonly badgeDescription = input<string | null>(null);

  private _badge: HTMLElement | null = null;
  private _description: HTMLElement | null = null;

  private readonly _effectiveVariant = computed<EgovBadgeVariant>(() => {
    if (this.badgeVariant() === 'count' && this.badgeSize() === 'extra-small') {
      if (isDevMode()) {
        console.warn(
          'egovBadge: size "extra-small" is dot-only; rendering a dot instead of the count. ' +
            'Use badgeDescription to announce the count, or size "small" and up to display it.',
        );
      }

      return 'dot';
    }

    return this.badgeVariant();
  });

  private readonly _content = computed<string | null>(() => {
    if (this._effectiveVariant() === 'dot') return '';

    const value = this.egovBadge();

    if (value == null || value === '') return null;

    const max = this.badgeMax();
    const count = typeof value === 'number' ? value : Number(value);

    if (max != null && Number.isFinite(count) && count > max) return `${max}+`;

    return `${value}`;
  });

  private readonly _badgeClasses = computed(() => {
    const position = this.badgePosition();
    const classes = [
      'badge',
      SIZE_CLASSES[this.badgeSize()],
      `badge--solid-${this.badgeColor()}`,
      'badge--fixed',
      position.includes('below') ? 'badge--below' : 'badge--above',
      position.includes('before') ? 'badge--before' : 'badge--after',
    ];

    if (this._effectiveVariant() === 'dot') classes.push('badge--dot');

    return classes.join(' ');
  });

  constructor() {
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
    this._renderer.setAttribute(element, 'class', 'egov-badge-description');
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
