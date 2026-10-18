import type { ElementRef, OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { CdkTreeNode, CdkTreeNodeToggle } from '@angular/cdk/tree';
import { MudTree } from './mud-tree.component';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudTreeItemStyles } from 'ngx-mud-ui/tree-item';

declare const ngDevMode: boolean | undefined;

/**
 * ```html
 * <a mud-tree-node *mudTreeNodeDef="let node of nav" [routerLink]="node.url" [isExpandable]="!!node.children?.length">
 *   <mud-icon icon name="group" [scale]="20" />
 *   {{ node.label }}
 *   <mud-badge trailing [count]="node.count" variant="neutral" size="xl" />
 * </a>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[mud-tree-node], button[mud-tree-node], div[mud-tree-node]',
  exportAs: 'mudTreeNode',
  template: `
    <span class="mud-tree-item__icon" aria-hidden="true"><ng-content select="[icon]" /></span>
    <span class="mud-tree-item__selected-icon" aria-hidden="true"><ng-content select="[selectedIcon]" /></span>
    <span class="mud-tree-item__label" #label><ng-content /></span>
    <span class="mud-tree-item__secondary"><ng-content select="[secondaryLabel]" /></span>
    <span class="mud-tree-item__trailing"><ng-content select="[trailing]" />@if (isExpandable) {<ng-template #chevron>@if (isExpanded) {<svg viewBox="0 0 20 20" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M3.217 13.35c.31.31.812.31 1.122 0l5.122-5.122a.76.76 0 0 1 1.078 0l5.122 5.122a.793.793 0 0 0 1.122-1.122L11.66 7.106a2.35 2.35 0 0 0-3.322 0l-5.122 5.122a.793.793 0 0 0 0 1.122z" clip-rule="evenodd"/></svg>} @else {<svg viewBox="0 0 20 20" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M3.217 6.65a.793.793 0 0 1 1.122 0l5.122 5.122a.76.76 0 0 0 1.078 0L15.66 6.65a.793.793 0 0 1 1.122 1.122l-5.122 5.122a2.35 2.35 0 0 1-3.322 0L3.217 7.772a.793.793 0 0 1 0-1.122" clip-rule="evenodd"/></svg>}</ng-template>@if (isDisabled) {<span class="mud-tree-item__toggle" aria-hidden="true" [attr.data-direction]="isExpanded ? 'up' : 'down'" (click)="$event.preventDefault()"><ng-container *ngTemplateOutlet="chevron" /></span>} @else {<span class="mud-tree-item__toggle" cdkTreeNodeToggle aria-hidden="true" [attr.data-direction]="isExpanded ? 'up' : 'down'" (click)="$event.preventDefault()"><ng-container *ngTemplateOutlet="chevron" /></span>}}</span>
  `,
  host: {
    class: 'mud-tree-item mud-tree-node',
    '[class.mud-tree-item--selected]': 'selected()',
    '[attr.aria-current]': '_ariaCurrent()',
    '[attr.aria-selected]': '_ariaSelected()',
    '[attr.aria-disabled]': 'isDisabled ? "true" : null',
    '[style.--mud-tree-item-depth]': 'level',
    '(click)': '_onRowClick($event)',
    '(keyup.space)': '_onSpaceUp($event)',
  },
  providers: [{ provide: CdkTreeNode, useExisting: MudTreeNode }],
  imports: [CdkTreeNodeToggle, NgTemplateOutlet],
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MudTreeNode<T, K = T> extends CdkTreeNode<T, K> implements OnInit {
  private readonly _host: HTMLElement = this._elementRef.nativeElement;
  private readonly _isAnchor = this._host.tagName === 'A';
  private readonly _label = viewChild.required<ElementRef<HTMLElement>>('label');
  private readonly _multiple = inject(MudTree, { optional: true })?.multiple ?? (() => false);

  /** @description Marks the node as the current page (aria-current), or as chosen in a `multiple` tree (aria-selected); same visuals either way. */
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly _ariaCurrent = computed(() =>
    this.selected() && !this._multiple() ? (this._isAnchor ? 'page' : 'true') : null,
  );

  constructor() {
    super();

    const styles = inject(MudStyleLoader);

    styles.load(_MudTreeItemStyles);
  }

  /** In a multiple tree every choice carries aria-selected; an unchosen section (it only opens) carries none. */
  protected _ariaSelected(): 'true' | 'false' | null {
    if (!this._multiple()) return null;

    if (this.selected()) return 'true';

    return this.isExpandable ? null : 'false';
  }

  override ngOnInit(): void {
    super.ngOnInit();

    if ((typeof ngDevMode === 'undefined' || ngDevMode) && this._isAnchor && this.isDisabled) {
      console.warn('mud-tree-node: a link cannot be disabled; use a button or div host for a disabled node.');
    }
  }

  override getLabel(): string {
    return this.typeaheadLabel || this._label().nativeElement.textContent?.trim() || '';
  }

  override activate(): void {
    if (this.isDisabled) return;

    super.activate();
    this._host.click();
  }

  /** Firefox activates buttons on keyup; activation is already replayed on keydown. */
  protected _onSpaceUp(event: Event): void {
    if (this._host.tagName === 'BUTTON') event.preventDefault();
  }

  /** Group parents toggle; page parents (links) only ever expand, since the click also navigates. */
  protected _onRowClick(event: Event): void {
    if (this.isDisabled) {
      event.preventDefault();

      return;
    }

    if (!this.isExpandable) return;

    if (!this.isExpanded) this.expand();
    else if (!this._isAnchor) this.collapse();
  }
}
