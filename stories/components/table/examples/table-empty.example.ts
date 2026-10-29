import { Component } from '@angular/core';
import {
  MudTable,
  MudColumnDef,
  MudHeaderCellDef,
  MudCellDef,
  MudHeaderCell,
  MudCell,
  MudHeaderRowDef,
  MudRowDef,
  MudHeaderRow,
  MudRow,
  MudNoDataRow,
} from 'ngx-mud-ui/table';

interface Cerere {
  id: number;
  nume: string;
  localitate: string;
  depusa: string;
  suma: number;
  stare: string;
}

@Component({
  selector: 'app-table-empty',
  imports: [
    MudTable,
    MudColumnDef,
    MudHeaderCellDef,
    MudCellDef,
    MudHeaderCell,
    MudCell,
    MudHeaderRowDef,
    MudRowDef,
    MudHeaderRow,
    MudRow,
    MudNoDataRow,
  ],
  template: `
    <table mud-table [dataSource]="rows" aria-label="Cereri depuse">
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef>Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <ng-container mudColumnDef="localitate">
        <th mud-header-cell *mudHeaderCellDef>Localitate</th>
        <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
      </ng-container>
      <ng-container mudColumnDef="depusa">
        <th mud-header-cell *mudHeaderCellDef>Depusă la</th>
        <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
        <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      <!-- rendered only while the data source is empty; span every column -->
      <tr *mudNoDataRow>
        <td [attr.colspan]="columns.length">Nu există cereri depuse.</td>
      </tr>
    </table>
  `,
})
export class TableEmptyExample {
  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  readonly rows: Cerere[] = [];
}
