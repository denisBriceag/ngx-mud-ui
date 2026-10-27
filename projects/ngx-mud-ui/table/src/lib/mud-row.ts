import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, input, ViewEncapsulation } from '@angular/core';
import {
  CDK_ROW_TEMPLATE,
  CdkCellOutlet,
  CdkFooterRow,
  CdkFooterRowDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkNoDataRow,
  CdkRow,
  CdkRowDef,
} from '@angular/cdk/table';

/** `<tr mud-header-row *mudHeaderRowDef="columns; sticky: true"></tr>` */
@Directive({
  selector: '[mudHeaderRowDef]',
  providers: [{ provide: CdkHeaderRowDef, useExisting: MudHeaderRowDef }],
  // Inherited CDK fields can only be re-aliased through the metadata form.
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [
    { name: 'columns', alias: 'mudHeaderRowDef' },
    { name: 'sticky', alias: 'mudHeaderRowDefSticky', transform: booleanAttribute },
  ],
})
export class MudHeaderRowDef extends CdkHeaderRowDef {}

/** `<tr mud-footer-row *mudFooterRowDef="columns"></tr>` */
@Directive({
  selector: '[mudFooterRowDef]',
  providers: [{ provide: CdkFooterRowDef, useExisting: MudFooterRowDef }],
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [
    { name: 'columns', alias: 'mudFooterRowDef' },
    { name: 'sticky', alias: 'mudFooterRowDefSticky', transform: booleanAttribute },
  ],
})
export class MudFooterRowDef extends CdkFooterRowDef {}

/** `<tr mud-row *mudRowDef="let row; columns: columns; when: isUrgent"></tr>` */
@Directive({
  selector: '[mudRowDef]',
  providers: [{ provide: CdkRowDef, useExisting: MudRowDef }],
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [
    { name: 'columns', alias: 'mudRowDefColumns' },
    { name: 'when', alias: 'mudRowDefWhen' },
  ],
})
export class MudRowDef<T> extends CdkRowDef<T> {}

/** Header row; the `<tr>` form is used inside a native `<table mud-table>`. */
@Component({
  selector: 'mud-header-row, tr[mud-header-row]',
  exportAs: 'mudHeaderRow',
  template: CDK_ROW_TEMPLATE,
  host: { class: 'mud-data-table__header-row', role: 'row' },
  // CDK fills the row through its cell outlet imperatively; an OnPush row would never re-render them.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkHeaderRow, useExisting: MudHeaderRow }],
  imports: [CdkCellOutlet],
})
export class MudHeaderRow extends CdkHeaderRow {}

@Component({
  selector: 'mud-footer-row, tr[mud-footer-row]',
  exportAs: 'mudFooterRow',
  template: CDK_ROW_TEMPLATE,
  host: { class: 'mud-data-table__footer-row', role: 'row' },
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkFooterRow, useExisting: MudFooterRow }],
  imports: [CdkCellOutlet],
})
export class MudFooterRow extends CdkFooterRow {}

/** `<tr mud-row *mudRowDef="let row; columns: columns" [selected]="selection.isSelected(row)"></tr>` */
@Component({
  selector: 'mud-row, tr[mud-row]',
  exportAs: 'mudRow',
  template: CDK_ROW_TEMPLATE,
  host: {
    class: 'mud-data-table__row',
    role: 'row',
    '[class.mud-data-table__row--selected]': 'selected()',
    '[attr.aria-selected]': 'selected() ? true : null',
  },
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: CdkRow, useExisting: MudRow }],
  imports: [CdkCellOutlet],
})
export class MudRow extends CdkRow {
  /** @description Marks the row as selected (background and `aria-selected`). */
  readonly selected = input(false, { transform: booleanAttribute });
}

/**
 * ```html
 * <tr *mudNoDataRow>
 *   <td [attr.colspan]="columns.length">Nimic de afișat</td>
 * </tr>
 * ```
 */
@Directive({
  selector: 'ng-template[mudNoDataRow]',
  providers: [{ provide: CdkNoDataRow, useExisting: MudNoDataRow }],
})
export class MudNoDataRow extends CdkNoDataRow {
  override _cellSelector = 'td, mud-cell, [mud-cell], .mud-data-table__cell';

  constructor() {
    super();
    this._contentClassNames.push('mud-data-table__no-data-row');
    this._cellClassNames.push('mud-data-table__cell', 'mud-data-table__no-data-cell');
  }
}
