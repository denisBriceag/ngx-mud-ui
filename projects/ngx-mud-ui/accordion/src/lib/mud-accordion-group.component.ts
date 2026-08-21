import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { CDK_ACCORDION, CdkAccordion } from '@angular/cdk/accordion';

/**
 * ```html
 * <mud-accordion-group [multi]="false">
 *   <mud-accordion>…</mud-accordion>
 *   <mud-accordion>…</mud-accordion>
 * </mud-accordion-group>
 * ```
 */
@Component({
  selector: 'mud-accordion-group',
  template: '<ng-content />',
  host: {
    class: 'accordion',
    '(keydown)': '_onKeydown($event)',
  },
  providers: [{ provide: CDK_ACCORDION, useExisting: MudAccordionGroup }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudAccordionGroup extends CdkAccordion {
  constructor() {
    super();
    this.multi = true;
  }

  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected _onKeydown(event: KeyboardEvent): void {
    const { key } = event;

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    /**
     * @description Items may be wrapped in intermediate elements, so a child-combinator
     * query would silently miss them. Instead take every descendant trigger
     * that (a) belongs to this group rather than a nested one and (b) is not
     * inside an item's panel (an accordion nested in another's content).
     * */
    const host = this._el.nativeElement;
    const triggers = Array.from(
      host.querySelectorAll<HTMLButtonElement>('mud-accordion-header .accordion__trigger'),
    ).filter((trigger) => {
      if (trigger.closest('mud-accordion-group') !== host) return false;

      const panel = trigger.closest('.accordion__body');

      return !panel || !host.contains(panel);
    });
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
