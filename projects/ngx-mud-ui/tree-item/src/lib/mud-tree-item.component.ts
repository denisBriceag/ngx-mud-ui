import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
  ViewEncapsulation,
} from '@angular/core';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudTreeItemStyles } from './mud-tree-item-styles.component';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <a mud-tree-item routerLink="/users" routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive">
 *   <mud-icon icon name="group" [scale]="20" />
 *   <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
 *   Users
 *   <span secondaryLabel>12 new</span>
 *   <mud-badge trailing [count]="3" variant="neutral" size="xl" />
 * </a>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[mud-tree-item], button[mud-tree-item]',
  exportAs: 'mudTreeItem',
  template: `
    <span class="mud-tree-item__icon" aria-hidden="true"><ng-content select="[icon]" /></span>
    <span class="mud-tree-item__selected-icon" aria-hidden="true"><ng-content select="[selectedIcon]" /></span>
    <span class="mud-tree-item__label"><ng-content /></span>
    <span class="mud-tree-item__secondary"><ng-content select="[secondaryLabel]" /></span>
    <span class="mud-tree-item__trailing"><ng-content select="[trailing]" /></span>
  `,
  host: {
    class: 'mud-tree-item',
    '[class.mud-tree-item--selected]': 'selected()',
    '[attr.aria-current]': '_ariaCurrent()',
    '[style.--mud-tree-item-depth]': '_depth()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MudTreeItem {
  private readonly _isAnchor = (inject(ElementRef).nativeElement as HTMLElement).tagName === 'A';

  /** @description Marks the row as the current page (aria-current). */
  readonly selected = input(false, { transform: booleanAttribute });
  /** @description Nesting depth when used outside a tree; every level past 1 indents the row by 32px. */
  readonly level = input(1, { transform: numberAttribute });

  protected readonly _ariaCurrent = computed(() => (this.selected() ? (this._isAnchor ? 'page' : 'true') : null));

  protected readonly _depth = computed(() => {
    const level = this.level();

    if (Number.isInteger(level) && level >= 1) return level - 1;

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(`mud-tree-item: level must be an integer ≥ 1, got ${level}; rendering as level 1.`);
    }

    return 0;
  });

  constructor() {
    const styles = inject(MudStyleLoader);

    styles.load(_MudTreeItemStyles);
  }
}
