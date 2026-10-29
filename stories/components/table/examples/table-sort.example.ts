import { afterNextRender, Component, viewChild } from '@angular/core';
import {
  MudCell,
  MudCellDef,
  MudColumnDef,
  MudHeaderCell,
  MudHeaderCellDef,
  MudHeaderRow,
  MudHeaderRowDef,
  MudRow,
  MudRowDef,
  MudSort,
  MudSortHeader,
  MudTable,
  MudTableDataSource,
} from 'ngx-mud-ui/table';

interface Cerere {
  nume: string;
  localitate: string;
  depusa: string;
  suma: number;
}

@Component({
  selector: 'app-table-sort',
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
    MudSort,
    MudSortHeader,
  ],
  template: `
    <table
      mud-table
      [dataSource]="source"
      mudSort
      active="depusa"
      direction="desc"
      aria-label="Cereri depuse"
    >
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <ng-container mudColumnDef="localitate">
        <!-- A header can opt out of sorting. -->
        <th mud-header-cell *mudHeaderCellDef mud-sort-header disabled>Localitate</th>
        <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
      </ng-container>
      <ng-container mudColumnDef="depusa">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc">Depusă la</th>
        <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header>Suma (MDL)</th>
        <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
export class TableSortExample {
  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  // Sorts in memory once it has the MudSort.
  readonly source = new MudTableDataSource<Cerere>([
    { nume: 'Ana Rusu', localitate: 'Chișinău', depusa: '2026-09-01', suma: 250 },
    { nume: 'Ion Ceban', localitate: 'Bălți', depusa: '2026-08-28', suma: 1200 },
    { nume: 'Maria Popescu', localitate: 'Cahul', depusa: '2026-09-10', suma: 80 },
    { nume: 'Vasile Lungu', localitate: 'Orhei', depusa: '2026-09-05', suma: 640 },
  ]);
  readonly sort = viewChild.required(MudSort);

  constructor() {
    // viewChild resolves after the first render, so hand the sort over then.
    afterNextRender(() => (this.source.sort = this.sort()));
  }
}
