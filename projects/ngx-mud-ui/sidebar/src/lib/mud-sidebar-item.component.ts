import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudSidebarStyles } from './mud-sidebar-styles.component';
import { _MudTreeItemStyles } from 'ngx-mud-ui/tree-item';

/**
 * ```html
 * <a mud-sidebar-item routerLink="drafts" routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive">
 *   <mud-icon icon name="edit" [scale]="20" />
 *   Schițe
 *   <mud-badge trailing [count]="1" variant="neutral" size="xl" />
 * </a>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[mud-sidebar-item], button[mud-sidebar-item]',
  exportAs: 'mudSidebarItem',
  template: `
    <span class="mud-tree-item__icon" aria-hidden="true"><ng-content select="[icon]" /></span>
    <span class="mud-tree-item__selected-icon" aria-hidden="true"><ng-content select="[selectedIcon]" /></span>
    <span class="mud-tree-item__label"><ng-content /></span>
    <span class="mud-tree-item__secondary"><ng-content select="[secondaryLabel]" /></span>
    <span class="mud-tree-item__trailing"><ng-content select="[trailing]" /></span>
  `,
  host: {
    class: 'mud-tree-item mud-sidebar-item',
    '[class.mud-tree-item--selected]': 'selected()',
    '[attr.aria-current]': '_ariaCurrent()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MudSidebarItem {
  private readonly _isAnchor = (inject(ElementRef).nativeElement as HTMLElement).tagName === 'A';

  /** @description Marks the row as the current page (aria-current). */
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly _ariaCurrent = computed(() => (this.selected() ? (this._isAnchor ? 'page' : 'true') : null));

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudSidebarStyles);
    styles.load(_MudTreeItemStyles);
  }
}
