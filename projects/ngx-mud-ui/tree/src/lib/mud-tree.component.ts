import { booleanAttribute, ChangeDetectionStrategy, Component, ElementRef, inject, input, ViewEncapsulation } from '@angular/core';
import { CdkTree, CdkTreeNodeOutlet } from '@angular/cdk/tree';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <mud-tree [dataSource]="nav" [childrenAccessor]="childrenOf" aria-label="Main navigation">
 *   <a mud-tree-node *mudTreeNodeDef="let node of nav" [routerLink]="node.url">{{ node.label }}</a>
 *   <button mud-tree-node *mudTreeNodeDef="let node of nav; when: isGroup" [isExpandable]="true">{{ node.label }}</button>
 * </mud-tree>
 * ```
 */
@Component({
  selector: 'mud-tree',
  exportAs: 'mudTree',
  template: `<ng-container cdkTreeNodeOutlet />`,
  host: { class: 'mud-tree', '[attr.aria-multiselectable]': 'multiple() ? "true" : null' },
  providers: [{ provide: CdkTree, useExisting: MudTree }],
  imports: [CdkTreeNodeOutlet],
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MudTree<T, K = T> extends CdkTree<T, K> {
  private readonly _treeHost: HTMLElement = inject(ElementRef).nativeElement;

  /** @description Several nodes can be chosen at once (filters): `selected` then maps to aria-selected instead of aria-current. */
  readonly multiple = input(false, { transform: booleanAttribute });

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;

    if (!this._treeHost.hasAttribute('aria-label') && !this._treeHost.hasAttribute('aria-labelledby')) {
      console.warn('mud-tree: add aria-label or aria-labelledby so screen readers can name the navigation.');
    }

    if (this.levelAccessor) {
      console.warn(
        'mud-tree: levelAccessor is not supported — collapsed rows would stay in the keyboard order. ' +
          'Pass nested data with childrenAccessor instead.',
      );
    }
  }
}
