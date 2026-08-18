import { ChangeDetectionStrategy, Component, inject, input, numberAttribute } from '@angular/core';
import { EgovAccordion } from './egov-accordion.component';

@Component({
  selector: 'egov-accordion-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'accordion__header',
    role: 'heading',
    '[attr.aria-level]': 'headingLevel()',
  },
  template: `
    <button
      type="button"
      class="accordion__trigger"
      [id]="_item._headerId"
      [attr.aria-expanded]="_item._expandedState()"
      [attr.aria-controls]="_item._panelId"
      [attr.aria-disabled]="_item._disabledState() ? 'true' : null"
      (click)="_toggle()"
    >
      <ng-content />
      @if (!_item.hideToggle()) {
        <span class="accordion__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 20" width="20" height="20" fill="currentColor" focusable="false">
            <path
              fill-rule="evenodd"
              d="M10.395 2.16c.404 0 .732.328.732.732v6.371h6.371a.732.732 0 1 1 0 1.464h-6.371v6.371a.732.732 0 0 1-1.464 0v-6.371H3.292a.732.732 0 0 1 0-1.464h6.371V2.892c0-.404.328-.732.732-.732"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      }
    </button>
  `,
})
export class EgovAccordionHeader {
  /**
   * @description Heading level exposed to assistive tech (aria-level).
   * */
  readonly headingLevel = input(3, { transform: numberAttribute });

  protected readonly _item = inject(EgovAccordion);

  protected _toggle(): void {
    if (!this._item.disabled) this._item.toggle();
  }
}
