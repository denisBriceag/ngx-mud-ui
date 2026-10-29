import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { CdkAccordionItem } from '@angular/cdk/accordion';
import { MudAccordionGroup } from './mud-accordion-group.component';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudAccordionStyles } from './mud-accordion-styles.component';

/** Below this item width, trailing header content moves under the text. */
const NARROW_BELOW = 600;

/**
 * ```html
 * <mud-accordion [expanded]="true" (afterExpand)="onShown()">
 *   <mud-accordion-header>
 *     <mud-icon icon-start name="document" [scale]="20" />
 *     <mud-accordion-title>Heading</mud-accordion-title>
 *     <mud-accordion-description>Supporting text</mud-accordion-description>
 *     <a trailing routerLink="/pas-1">Editează</a>
 *   </mud-accordion-header>
 *   Expandable content
 * </mud-accordion>
 * ```
 */
@Component({
  selector: 'mud-accordion',
  host: {
    class: 'accordion__item',
    '[class.accordion__item--open]': '_expandedState()',
    '[class.accordion__item--sm]': "_size() === 'small'",
    '[class.accordion__item--icon-left]': "_iconPosition() === 'left'",
    '[class.accordion__item--no-toggle]': 'hideToggle()',
    '[class.accordion__item--narrow]': '_narrow()',
    '[class.accordion__item--trail-sites]': "_appearance() === 'trail-sites'",
  },
  template: `
    <ng-content select="mud-accordion-header" />
    <div
      #body
      class="accordion__body"
      [class.accordion__body--expanded]="_expandedState()"
      role="region"
      [id]="_panelId"
      [attr.aria-labelledby]="_headerId"
      [attr.inert]="_expandedState() ? null : ''"
      (transitionend)="_onTransitionEnd($event)"
    >
      <div class="accordion__body-inner">
        <div class="accordion__panel">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudAccordion extends CdkAccordionItem {
  /** @description Hides the +/- toggle; the header still opens and closes the section. */
  readonly hideToggle = input(false, { transform: booleanAttribute });

  /** @description Fires once the open animation has finished. */
  readonly afterExpand = output<void>();

  /** @description Fires once the close animation has finished. */
  readonly afterCollapse = output<void>();

  /** @docs-private Signal mirrors of the CDK getter/setter state, for OnPush templates. */
  readonly _expandedState = signal(false);
  readonly _disabledState = signal(false);

  readonly _headerId = `${this.id}-header`;
  readonly _panelId = `${this.id}-panel`;

  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly _group = inject(MudAccordionGroup, { optional: true });

  /** @docs-private Appearance/size/iconPosition come from the owning group. */
  readonly _appearance = computed(() => this._group?.appearance() ?? 'default');
  /** @docs-private */
  readonly _size = computed(() => this._group?.size() ?? 'medium');
  /** @docs-private */
  readonly _iconPosition = computed(() => this._group?.iconPosition() ?? 'right');

  /** @docs-private True below NARROW_BELOW px of the item's own width. */
  readonly _narrow = signal(false);

  private _viewReady = false;
  private _pendingAfterEvent: 'expand' | 'collapse' | null = null;
  private _fallbackTimer: ReturnType<typeof setTimeout> | null = null;

  override get expanded(): boolean {
    return super.expanded;
  }

  override set expanded(value: boolean) {
    const was = super.expanded;

    super.expanded = value;
    this._expandedState.set(super.expanded);

    if (was !== super.expanded) this._scheduleAfterEvent(super.expanded);
  }

  override get disabled(): boolean {
    return super.disabled;
  }

  override set disabled(value: boolean) {
    super.disabled = value;
    this._disabledState.set(super.disabled);
  }

  constructor() {
    super();

    inject(MudStyleLoader).load(_MudAccordionStyles);
    inject(DestroyRef).onDestroy(() => this._clearFallbackTimer());

    if (this._isBrowser && typeof ResizeObserver !== 'undefined') {
      const host: HTMLElement = inject(ElementRef).nativeElement;
      const observer = new ResizeObserver(([entry]) =>
        this._narrow.set(entry.contentRect.width < NARROW_BELOW),
      );

      observer.observe(host);
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    }

    afterNextRender(() => {
      this._viewReady = true;
    });
  }

  protected _onTransitionEnd(event: TransitionEvent): void {
    if (event.target === this._body().nativeElement && event.propertyName === 'grid-template-rows') {
      this._flushAfterEvent();
    }
  }

  private _scheduleAfterEvent(expanded: boolean): void {
    if (!this._isBrowser || !this._viewReady) return;

    this._pendingAfterEvent = expanded ? 'expand' : 'collapse';
    this._clearFallbackTimer();

    // transitionend never fires without a transition (reduced motion, no styles); fall back to a timer.
    afterNextRender(
      () => {
        if (!this._pendingAfterEvent) return;

        const style = getComputedStyle(this._body().nativeElement);
        const durations = (style.transitionDuration || '0s').split(',');
        const delays = (style.transitionDelay || '0s').split(',');
        const total = durations.reduce(
          (max, part, i) =>
            Math.max(max, (parseFloat(part) || 0) + (parseFloat(delays[i] ?? delays[0]) || 0)),
          0,
        );

        if (total <= 0) {
          this._flushAfterEvent();

          return;
        }

        this._fallbackTimer = setTimeout(() => this._flushAfterEvent(), total * 1000 + 50);
      },
      { injector: this._injector },
    );
  }

  private _flushAfterEvent(): void {
    this._clearFallbackTimer();

    const pending = this._pendingAfterEvent;

    this._pendingAfterEvent = null;

    if (pending === 'expand') this.afterExpand.emit();
    else if (pending === 'collapse') this.afterCollapse.emit();
  }

  private _clearFallbackTimer(): void {
    if (this._fallbackTimer !== null) {
      clearTimeout(this._fallbackTimer);
      this._fallbackTimer = null;
    }
  }
}
