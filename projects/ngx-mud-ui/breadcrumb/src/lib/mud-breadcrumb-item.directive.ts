import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  ViewContainerRef,
} from '@angular/core';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

declare const ngDevMode: boolean | undefined;

/** State the parent breadcrumb assigns; a crumb never decides these for itself. */
export interface MudBreadcrumbItemState {
  collapsed: boolean;
  current: boolean;
}

/** Labels longer than this truncate with an ellipsis and grow a tooltip. */
const TRUNCATE_AT = 30;

/** Elements that can be the crumb's real click/focus target inside the <li>. */
const INTERACTIVE = 'a,button';

/** Tag names and roles that make the crumb's surroundings a genuine list. */
const LIST_TAGS = new Set(['OL', 'UL', 'MENU']);

/**
 * ```html
 * <li mudBreadcrumbItem><a routerLink="/servicii">Servicii</a></li>
 * <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
 * ```
 *
 * Sits on the `<li>`, so the trail is a real `<nav><ol><li>` list; the
 * consumer's own anchor stays inside it and keeps `routerLink`. ARIA state and
 * the tooltip are redirected onto that anchor — see `target()`.
 *
 * The truncation tooltip is driven by `text()`, which falls back to
 * `element.textContent` — a non-reactive DOM read, so it only re-evaluates
 * when the `label` input changes, not when projected content changes on its own.
 */
@Directive({
  selector: '[mudBreadcrumbItem]',
  exportAs: 'mudBreadcrumbItem',
  hostDirectives: [MudTooltip],
  host: {
    class: 'mud-breadcrumb__item',
    '[class.mud-breadcrumb__item--active]': 'isCurrent()',
    '[class.mud-breadcrumb__item--disabled]': 'disabled()',
    '[class.mud-breadcrumb__item--collapsed]': 'collapsed()',
  },
})
export class MudBreadcrumbItem {
  /** The consumer's `<li>`. The crumb's box, not its click target — see `target()`. */
  readonly element: HTMLElement = inject(ElementRef).nativeElement;
  /** Anchors views immediately after this element; the overflow trigger uses it. */
  readonly viewContainerRef = inject(ViewContainerRef);

  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _state = signal<MudBreadcrumbItemState>({ collapsed: false, current: false });
  private readonly _tooltip = inject(MudTooltip, { self: true });

  private _ariaTarget: HTMLElement | null = null;
  private _warnedAboutStructure = false;

  /** @description Marks this crumb as the current page. Renders as text, never underlined. */
  readonly active = input(false, { transform: booleanAttribute });
  /** @description Blocks activation and greys the crumb out, while keeping it focusable. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Text override for the overflow panel and back link when content is not plain text. */
  readonly label = input<string | undefined>(undefined);

  /** True when this crumb is the current page, whether set explicitly or resolved by the parent. */
  readonly isCurrent = computed(() => this.active() || this._state().current);
  /** True while this crumb lives in the overflow panel instead of the trail. */
  readonly collapsed = computed(() => this._state().collapsed);

  private readonly _tooltipContent = computed(() => {
    const text = this.text();

    return text.length > TRUNCATE_AT ? text : null;
  });

  constructor() {
    if (this._isBrowser) {
      this.element.addEventListener('click', (event) => this._blockInert(event), { capture: true });
    }

    effect(() => {
      this._tooltip.setContent(this._tooltipContent());
      // Read both states so the effect re-runs when either flips.
      this._syncAria(this.isCurrent(), this.disabled());
    });
  }

  /** Called by MudBreadcrumb. Crumbs never manage their own collapse or current state. */
  setState(state: MudBreadcrumbItemState): void {
    this._state.set(state);
  }

  /**
   * The crumb's real interactive element — the consumer's `<a>` or `<button>`
   * inside the `<li>`, or the `<li>` itself for a plain text crumb. This is what
   * a synthesised click must hit; firing on the `<li>` would never run routerLink.
   */
  target(): HTMLElement {
    return this.element.querySelector<HTMLElement>(INTERACTIVE) ?? this.element;
  }

  /** Text for the overflow panel and the back link. */
  text(): string {
    return this.label() ?? this.element.textContent?.trim() ?? '';
  }

  /** Resolved navigation target, or null for a text crumb. routerLink writes this attribute. */
  href(): string | null {
    return this.target().getAttribute('href');
  }

  private _syncAria(current: boolean, disabled: boolean): void {
    const target = this.target();

    if (this._ariaTarget && this._ariaTarget !== target) {
      this._ariaTarget.removeAttribute('aria-current');
      this._ariaTarget.removeAttribute('aria-disabled');
    }

    this._ariaTarget = target;
    this._toggleAttribute(target, 'aria-current', current ? 'page' : null);
    this._toggleAttribute(target, 'aria-disabled', disabled ? 'true' : null);
    // The tooltip's host is the <li>, which is neither focusable nor described;
    // point its aria-describedby and its overlay at the same control.
    this._tooltip.setAnchor(target === this.element ? null : target);
    this._warnAboutStructure();
  }

  private _toggleAttribute(element: HTMLElement, name: string, value: string | null): void {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  }

  private _warnAboutStructure(): void {
    if (this._warnedAboutStructure) return;

    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

    const parent = this.element.parentElement;
    const isListItem =
      this.element.tagName === 'LI' || this.element.getAttribute('role') === 'listitem';
    const inList =
      parent !== null &&
      (LIST_TAGS.has(parent.tagName) || parent.getAttribute('role') === 'list');

    if (isListItem && inList) return;

    this._warnedAboutStructure = true;
    console.warn(
      `[mud-breadcrumb] mudBreadcrumbItem belongs on an <li> inside the <ol> of a ` +
        `<nav mudBreadcrumb> (got <${this.element.tagName.toLowerCase()}> in ` +
        `<${parent?.tagName.toLowerCase() ?? 'nothing'}>). Without that, the trail ` +
        `renders correctly but screen readers never announce it as a list.`,
    );
  }

  private _blockInert(event: Event): void {
    if (!this.disabled() && !this.isCurrent()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
