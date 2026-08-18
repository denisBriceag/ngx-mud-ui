import { isPlatformBrowser } from '@angular/common';
import type {
  ElementRef} from '@angular/core';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { CdkAccordionItem } from '@angular/cdk/accordion';

/**
 * ```html
 * <egov-accordion [expanded]="true" (afterExpand)="onShown()">
 *   <egov-accordion-header>
 *     <egov-accordion-title>Heading</egov-accordion-title>
 *     <egov-accordion-description>Supporting text</egov-accordion-description>
 *   </egov-accordion-header>
 *   Expandable content
 * </egov-accordion>
 * ```
 */
@Component({
  selector: 'egov-accordion',
  host: {
    class: 'accordion__item',
  },
  template: `
    <ng-content select="egov-accordion-header" />
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
export class EgovAccordion extends CdkAccordionItem {
  readonly hideToggle = input(false, { transform: booleanAttribute });

  /** Emitted after the body's expansion animation happens. */
  readonly afterExpand = output<void>();

  /** Emitted after the body's collapse animation happens. */
  readonly afterCollapse = output<void>();

  /**
   * @docs-private Signal mirrors of the CDK getter/setter state, for OnPush templates.
   * */
  readonly _expandedState = signal(false);
  readonly _disabledState = signal(false);

  readonly _headerId = `${this.id}-header`;
  readonly _panelId = `${this.id}-panel`;

  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _body = viewChild.required<ElementRef<HTMLElement>>('body');

  // The after* events describe animations, so an initially-expanded panel
  // (rendered without animating, like mat-expansion-panel) must not emit.
  private _viewReady = false;
  private _pendingAfterEvent: 'expand' | 'collapse' | null = null;

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

    // When no transition will run (prefers-reduced-motion, or styles not
    // loaded), transitionend never fires — emit right after the render.
    afterNextRender(
      () => {
        if (!this._pendingAfterEvent) return;

        const duration = getComputedStyle(this._body().nativeElement).transitionDuration || '0s';
        const animates = duration.split(',').some((part) => parseFloat(part) > 0);

        if (!animates) this._flushAfterEvent();
      },
      { injector: this._injector },
    );
  }

  private _flushAfterEvent(): void {
    const pending = this._pendingAfterEvent;

    this._pendingAfterEvent = null;

    if (pending === 'expand') this.afterExpand.emit();
    else if (pending === 'collapse') this.afterCollapse.emit();
  }
}
