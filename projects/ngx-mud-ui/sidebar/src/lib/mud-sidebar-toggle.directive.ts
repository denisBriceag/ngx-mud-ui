import { Directive, inject } from '@angular/core';
import { MUD_SIDEBAR } from './mud-sidebar-context';

/**
 * ```html
 * <button mudIconButton mudSidebarToggle aria-label="Meniu"><mud-icon name="sidebar" [scale]="20" /></button>
 * ```
 */
@Directive({
  selector: 'button[mudSidebarToggle]',
  exportAs: 'mudSidebarToggle',
  host: {
    class: 'mud-sidebar-toggle',
    type: 'button',
    '[attr.aria-expanded]': '!_sidebar.collapsed()',
    '[attr.aria-controls]': '_sidebar.id()',
    '[style.display]': '_sidebar.narrow() ? "none" : null',
    '(click)': '_sidebar.toggle()',
  },
})
export class MudSidebarToggle {
  protected readonly _sidebar = inject(MUD_SIDEBAR);
}
