import { booleanAttribute, ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
import {
  CDK_TABLE,
  CdkTable,
  DataRowOutlet,
  FooterRowOutlet,
  HeaderRowOutlet,
  NoDataRowOutlet,
  STICKY_POSITIONING_LISTENER,
} from '@angular/cdk/table';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudTableStyles } from './mud-table-styles.component';

export type MudTableHeaderStyle = 'subtle' | 'strong' | 'white';
export type MudTableRowStyle = 'default' | 'zebra';

/**
 * ```html
 * <table mud-table [dataSource]="rows" headerStyle="strong" rowStyle="zebra" hoverable>
 *   <ng-container mudColumnDef="nume">
 *     <th mud-header-cell *mudHeaderCellDef>Nume</th>
 *     <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
 *   </ng-container>
 *   <tr mud-header-row *mudHeaderRowDef="['nume']"></tr>
 *   <tr mud-row *mudRowDef="let row; columns: ['nume']"></tr>
 * </table>
 * ```
 */
@Component({
  selector: 'mud-table, table[mud-table]',
  exportAs: 'mudTable',
  // Verbatim copy of CdkTable's template (CDK does not export it). The server branch
  // captures unprojected content so hydration does not throw; CDK removes it on the client.
  template: `
    <ng-content select="caption" />
    <ng-content select="colgroup, col" />

    @if (_isServer) {
      <ng-content />
    }

    @if (_isNativeHtmlTable) {
      <thead role="rowgroup">
        <ng-container headerRowOutlet />
      </thead>
      <tbody role="rowgroup">
        <ng-container rowOutlet />
        <ng-container noDataRowOutlet />
      </tbody>
      <tfoot role="rowgroup">
        <ng-container footerRowOutlet />
      </tfoot>
    } @else {
      <ng-container headerRowOutlet />
      <ng-container rowOutlet />
      <ng-container noDataRowOutlet />
      <ng-container footerRowOutlet />
    }
  `,
  host: {
    class: 'mud-data-table',
    '[class.mud-data-table--header-subtle]': 'headerStyle() === "subtle"',
    '[class.mud-data-table--header-strong]': 'headerStyle() === "strong"',
    '[class.mud-data-table--header-white]': 'headerStyle() === "white"',
    '[class.mud-data-table--rows-zebra]': 'rowStyle() === "zebra"',
    '[class.mud-data-table--hoverable]': 'hoverable()',
  },
  providers: [
    { provide: CdkTable, useExisting: MudTable },
    { provide: CDK_TABLE, useExisting: MudTable },
    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
  ],
  encapsulation: ViewEncapsulation.None,
  // CdkTable drives its outlets imperatively; Material also keeps the table Eager.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [HeaderRowOutlet, DataRowOutlet, NoDataRowOutlet, FooterRowOutlet],
})
export class MudTable<T> extends CdkTable<T> {
  /** @description Header treatment: 'subtle' light grey (default), 'strong' dark with white text for emphasis, or 'white' matching the body with a bottom line (tables inside cards). */
  readonly headerStyle = input<MudTableHeaderStyle>('subtle');
  /** @description Body rows: 'default' keeps only the divider under each row; 'zebra' also alternates the row background for long or dense tables. */
  readonly rowStyle = input<MudTableRowStyle>('default');
  /** @description Adds a hover background and pointer cursor to body rows; use it when rows are clickable (bind your own (click) on the row). */
  readonly hoverable = input(false, { transform: booleanAttribute });

  constructor() {
    super();
    inject(MudStyleLoader).load(_MudTableStyles);
  }
}
