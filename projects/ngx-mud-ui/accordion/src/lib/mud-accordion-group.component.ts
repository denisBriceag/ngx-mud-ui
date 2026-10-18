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
  /**
   * @description trail-sites tints OPEN items with the brand-secondary surface and
   * on-secondary text colors (the eGov "trail sites" pattern).
   */
  readonly appearance = input<MudAccordionAppearance>('default');

  /**
   * @description small compresses the header to the mobile type ramp (22/30) and 24px
   * block padding regardless of viewport - for dense surfaces.
   */
  readonly size = input<MudAccordionSize>('medium');

  /** @description left places the +/- trigger before the text (chevron-style navigation). */
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

    const enabled = (i: number) => triggers[i].getAttribute('aria-disabled') !== 'true';
    const count = triggers.length;
    let target = -1;

    // Official behavior: arrows wrap around and skip disabled headers;
    // Home/End land on the first/last enabled header.
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
