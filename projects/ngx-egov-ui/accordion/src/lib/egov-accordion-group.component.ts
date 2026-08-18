import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { CDK_ACCORDION, CdkAccordion } from '@angular/cdk/accordion';

/**
 * ```html
 * <egov-accordion-group [multi]="false">
 *   <egov-accordion>…</egov-accordion>
 *   <egov-accordion>…</egov-accordion>
 * </egov-accordion-group>
 * ```
 */
@Component({
  selector: 'egov-accordion-group',
  template: '<ng-content />',
  host: {
    class: 'accordion',
    '(keydown)': '_onKeydown($event)',
  },
  providers: [{ provide: CDK_ACCORDION, useExisting: EgovAccordionGroup }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovAccordionGroup extends CdkAccordion {
  constructor() {
    super();
    this.multi = true;
  }

  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected _onKeydown(event: KeyboardEvent): void {
    const { key } = event;

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    const triggers = Array.from(
      this._el.nativeElement.querySelectorAll<HTMLButtonElement>(
        ':scope > egov-accordion > egov-accordion-header .accordion__trigger',
      ),
    );
    const index = triggers.indexOf(event.target as HTMLButtonElement);

    if (index < 0 || triggers.length === 0) return;

    event.preventDefault();

    const next =
      key === 'ArrowDown'
        ? Math.min(index + 1, triggers.length - 1)
        : key === 'ArrowUp'
          ? Math.max(index - 1, 0)
          : key === 'Home'
            ? 0
            : triggers.length - 1;

    triggers[next].focus();
  }
}
