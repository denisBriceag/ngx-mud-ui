import { Directive, inject } from '@angular/core';

import { MUD_MEGA_MENU } from './mud-mega-menu.types';

/**
 * ```html
 * <a mudMegaMenuLink routerLink="/servicii/mpay">MPay</a>
 * ```
 */
@Directive({
  selector: 'a[mudMegaMenuLink]',
  host: {
    class: 'mega-menu__link',
    '(click)': '_onClick()',
  },
})
export class MudMegaMenuLink {
  private readonly _panel = inject(MUD_MEGA_MENU, { optional: true });

  protected _onClick(): void {
    this._panel?._linkActivated();
  }
}
