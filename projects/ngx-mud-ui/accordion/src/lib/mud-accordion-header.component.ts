import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { MudAccordion } from './mud-accordion.component';

@Component({
  selector: 'mud-accordion-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'accordion__header',
  },
  template: `
    <span class="accordion__heading-row" role="heading" [attr.aria-level]="headingLevel()">
      <button
        type="button"
        class="accordion__trigger"
        [id]="_item._headerId"
        [attr.aria-expanded]="_item._expandedState()"
        [attr.aria-controls]="_item._panelId"
        [attr.aria-disabled]="_item._disabledState() ? 'true' : null"
        (click)="_toggle()"
      >
        <span class="accordion__lead">
          <ng-content select="[icon-start]" />
          <span class="accordion__text"><ng-content /></span>
        </span>
        @if (!_item.hideToggle()) {
          <!-- Two bars: the vertical one collapses (scaleY) when open, morphing plus into minus. -->
          <span class="accordion__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="currentColor" focusable="false">
              <rect x="2.75" y="9.25" width="14.5" height="1.5" rx="0.75" />
              <rect class="accordion__icon-vertical" x="9.25" y="2.75" width="1.5" height="14.5" rx="0.75" />
            </svg>
          </span>
        }
      </button>
    </span>
    <span class="accordion__trailing" [attr.inert]="_item._disabledState() ? '' : null">
      <ng-content select="[trailing]" />
    </span>
  `,
})
export class MudAccordionHeader {
  /** @description Heading level exposed to assistive tech (aria-level). */
  readonly headingLevel = input(3, { transform: numberAttribute });

  protected readonly _item = inject(MudAccordion);

  protected _toggle(): void {
    if (!this._item.disabled) this._item.toggle();
  }
}
