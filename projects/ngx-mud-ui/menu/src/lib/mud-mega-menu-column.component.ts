import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * ```html
 * <mud-mega-menu-column heading="Servicii">
 *   <a mudMegaMenuLink href="/a">Option</a>
 * </mud-mega-menu-column>
 * ```
 */
@Component({
  selector: 'mud-mega-menu-column',
  template: `
    <h3 class="mega-menu__heading">{{ heading() }}</h3>
    <div class="mega-menu__separator" aria-hidden="true"></div>
    <div class="mega-menu__links"><ng-content /></div>
  `,
  host: { class: 'mega-menu__column' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudMegaMenuColumn {
  /** @description Column heading, rendered as an h3 above the links. */
  readonly heading = input.required<string>();
}
