import { Directive, Input } from '@angular/core';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkFooterCell,
  CdkFooterCellDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
} from '@angular/cdk/table';

/** `<td mud-cell *mudCellDef="let row">{{ row.nume }}</td>` */
@Directive({
  selector: '[mudCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: MudCellDef }],
})
export class MudCellDef extends CdkCellDef {}

/** `<th mud-header-cell *mudHeaderCellDef>Nume</th>` */
@Directive({
  selector: '[mudHeaderCellDef]',
  providers: [{ provide: CdkHeaderCellDef, useExisting: MudHeaderCellDef }],
})
export class MudHeaderCellDef extends CdkHeaderCellDef {}

/** `<td mud-footer-cell *mudFooterCellDef>Total</td>` */
@Directive({
  selector: '[mudFooterCellDef]',
  providers: [{ provide: CdkFooterCellDef, useExisting: MudFooterCellDef }],
})
export class MudFooterCellDef extends CdkFooterCellDef {}

/**
 * ```html
 * <ng-container mudColumnDef="nume" sticky>
 *   <th mud-header-cell *mudHeaderCellDef>Nume</th>
 *   <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[mudColumnDef]',
  providers: [{ provide: CdkColumnDef, useExisting: MudColumnDef }],
})
export class MudColumnDef extends CdkColumnDef {
  /** @description Unique column name referenced by the row definitions' `columns` list; also becomes the `mud-column-<name>` class on every cell, for per-column widths. */
  @Input('mudColumnDef')
  override get name(): string {
    return this._name;
  }

  override set name(name: string) {
    this._setNameInput(name);
  }

  protected override _updateColumnCssClassName(): void {
    super._updateColumnCssClassName();
    this._columnCssClassName.push(`mud-column-${this.cssClassFriendlyName}`);
  }
}

/** Header cell of a column; the `<th>` form is used inside a native `<table mud-table>`. */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mud-header-cell, th[mud-header-cell]',
  host: { class: 'mud-data-table__header-cell', role: 'columnheader' },
})
export class MudHeaderCell extends CdkHeaderCell {}

/** Footer cell of a column. */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mud-footer-cell, td[mud-footer-cell]',
  host: { class: 'mud-data-table__footer-cell' },
})
export class MudFooterCell extends CdkFooterCell {}

/** Body cell of a column. */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mud-cell, td[mud-cell]',
  host: { class: 'mud-data-table__cell' },
})
export class MudCell extends CdkCell {}
