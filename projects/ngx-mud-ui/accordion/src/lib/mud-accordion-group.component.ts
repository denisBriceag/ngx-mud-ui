import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { CDK_ACCORDION, CdkAccordion } from '@angular/cdk/accordion';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudAccordionStyles } from './mud-accordion-styles.component';

export type MudAccordionAppearance = 'default' | 'trail-sites';
export type MudAccordionSize = 'medium' | 'small';
export type MudAccordionIconPosition = 'right' | 'left';

/**
 * ```html
 * <mud-accordion-group [multi]="false" appearance="trail-sites">
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
  /** @description `trail-sites` tints open items with the brand-secondary surface. */
  readonly appearance = input<MudAccordionAppearance>('default');

  /** @description `small` uses the compact mobile header at every viewport. */
  readonly size = input<MudAccordionSize>('medium');

  /** @description `left` places the +/- trigger before the text. */
  readonly iconPosition = input<MudAccordionIconPosition>('right');

  constructor() {
    super();

    inject(MudStyleLoader).load(_MudAccordionStyles);
    this.multi = true;
  }

  private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected _onKeydown(event: KeyboardEvent): void {
    const { key } = event;

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    // Descendant query (items may be wrapped), minus triggers of nested groups or inside panels.
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

    const enabled = (i: number) => triggers[i].getAttribute('aria-disabled') !== 'true';
    const count = triggers.length;
    let target = -1;

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      const direction = key === 'ArrowDown' ? 1 : -1;
      let i = index;

      for (let step = 0; step < count; step++) {
        i = (i + direction + count) % count;

        if (enabled(i)) {
          target = i;
          break;
        }
      }
    } else {
      const order = key === 'Home' ? triggers.keys() : [...triggers.keys()].reverse();

      for (const i of order) {
        if (enabled(i)) {
          target = i;
          break;
        }
      }
    }

    if (target >= 0 && target !== index) triggers[target].focus();
  }
}
