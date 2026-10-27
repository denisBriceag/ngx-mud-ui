import type { ComponentRef } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { forwardCrumbClick } from './forward-crumb-click';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';
import { MudBreadcrumbOverflow } from './mud-breadcrumb-overflow.component';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { injectMudLabels, _mudText } from 'ngx-mud-ui/i18n';
import { _MudBreadcrumbStyles } from './mud-breadcrumb-styles.component';

/** Below two crumbs there is no "first plus last two" to collapse into. */
const MIN_VISIBLE = 2;

const coerceMaxVisible = (value: unknown): number => {
  const parsed = numberAttribute(value, MIN_VISIBLE);

  if (!Number.isFinite(parsed) || parsed < MIN_VISIBLE) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(
        `[mud-breadcrumb] maxVisible must be >= ${String(MIN_VISIBLE)} (got ${String(value)}). Coercing to ${String(MIN_VISIBLE)}.`,
      );
    }

    return MIN_VISIBLE;
  }

  return parsed;
};

/**
 * ```html
 * <nav mudBreadcrumb [maxVisible]="4">
 *   <ol>
 *     <li mudBreadcrumbItem><a routerLink="/">Acasă</a></li>
 *     <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
 *   </ol>
 * </nav>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'nav[mudBreadcrumb]',
  exportAs: 'mudBreadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (_backTarget(); as target) {
      @if (target.href(); as href) {
        <a class="mud-breadcrumb__back" [attr.href]="href" (click)="_goBack($event, target)">
          <span class="mud-breadcrumb__back-icon" aria-hidden="true"></span>
          <span class="mud-breadcrumb__back-label">{{ target.text() }}</span>
        </a>
      } @else {
        <button type="button" class="mud-breadcrumb__back" (click)="_goBack($event, target)">
          <span class="mud-breadcrumb__back-icon" aria-hidden="true"></span>
          <span class="mud-breadcrumb__back-label">{{ target.text() }}</span>
        </button>
      }
    }

    <ng-content />
  `,
  host: {
    class: 'mud-breadcrumb',
    '[attr.aria-label]': '_ariaLabel()',
    '[class.mud-breadcrumb--collapsible]': '_backTarget() !== null',
  },
})
export class MudBreadcrumb {
  private readonly _element: HTMLElement = inject(ElementRef).nativeElement;
  // Read once: the host binding would otherwise overwrite a consumer's static aria-label.
  private readonly _authoredAriaLabel = this._element.getAttribute('aria-label');

  /** @description Crumbs shown before the middle collapses into the overflow menu. */
  readonly maxVisible = input<number, unknown>(4, { transform: coerceMaxVisible });
  /** @description Accessible name for the navigation landmark. A consumer aria-label wins. */
  readonly label = input<string | undefined>(undefined);
  /** @description Accessible name for the overflow trigger. */
  readonly overflowLabel = input<string | undefined>(undefined);
  /** @description When false, the trail never collapses to the mobile back link. */
  readonly responsive = input(true, { transform: booleanAttribute });

  // descendants: true is load-bearing: crumbs sit inside the consumer's <ol>, not directly under the host.
  protected readonly _items = contentChildren(MudBreadcrumbItem, { descendants: true });

  private readonly _labels = injectMudLabels();

  protected readonly _ariaLabel = computed(() => this._authoredAriaLabel ?? _mudText(this.label(), this._labels().breadcrumb.navigation));

  /** Crumbs that live in the overflow panel: everything but the first and the last two. */
  protected readonly _collapsedItems = computed(() => {
    const items = this._items();

    return items.length > this.maxVisible() ? items.slice(1, -2) : [];
  });

  /** Explicit `active` wins; otherwise the last crumb that is navigable. */
  protected readonly _currentIndex = computed(() => {
    const items = this._items();
    const explicit = items.findIndex((item) => item.active());

    if (explicit !== -1) return explicit;

    for (let index = items.length - 1; index >= 0; index -= 1) {
      if (!items[index].disabled()) return index;
    }

    return items.length - 1;
  });

  /** The nearest navigable crumb above the current page — the only crumb mobile shows. */
  protected readonly _backTarget = computed(() => {
    if (!this.responsive()) return null;

    const items = this._items();

    if (items.length < 2) return null;

    for (let index = this._currentIndex() - 1; index >= 0; index -= 1) {
      const candidate = items[index];

      if (!candidate.disabled()) return candidate;
    }

    return null;
  });

  private _overflowRef: ComponentRef<MudBreadcrumbOverflow> | null = null;

  constructor() {
    inject(MudStyleLoader).load(_MudBreadcrumbStyles);

    effect(() => {
      const items = this._items();
      const collapsedItems = this._collapsedItems();
      const collapsed = new Set(collapsedItems);
      const currentIndex = this._currentIndex();

      items.forEach((item, index) => {
        item.setState({ collapsed: collapsed.has(item), current: index === currentIndex });
      });

      this._syncOverflow(items[0], collapsedItems);
    });
  }

  private _syncOverflow(
    owner: MudBreadcrumbItem | undefined,
    collapsed: readonly MudBreadcrumbItem[],
  ): void {
    if (collapsed.length === 0 || !owner) {
      this._overflowRef?.destroy();
      this._overflowRef = null;

      return;
    }

    if (!this._overflowRef) {
      this._overflowRef = owner.viewContainerRef.createComponent(MudBreadcrumbOverflow);
      this._overflowRef.onDestroy(() => {
        this._overflowRef = null;
      });
    }

    this._overflowRef.setInput('items', collapsed);
    this._overflowRef.setInput('label', this.overflowLabel());
  }

  protected _goBack(event: MouseEvent, target: MudBreadcrumbItem): void {
    forwardCrumbClick(event, target);
  }
}
