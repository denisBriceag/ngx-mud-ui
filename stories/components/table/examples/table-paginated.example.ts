import { Component, afterNextRender, viewChild } from '@angular/core';
import { MudPagination } from 'ngx-mud-ui/pagination';
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
  MudSort,
  MudSortHeader,
  MudTableDataSource,
} from 'ngx-mud-ui/table';

interface Cerere {
  id: number;
  nume: string;
  localitate: string;
  depusa: string;
  suma: number;
  stare: string;
}

// 47 generated requests, enough for several pages.
const NUME = [
  'Ana Rusu',
  'Ion Ceban',
  'Maria Popescu',
  'Vasile Lungu',
  'Elena Moraru',
  'Victor Cojocaru',
  'Natalia Grosu',
];
const LOCALITATI = ['Chișinău', 'Bălți', 'Cahul', 'Orhei', 'Ungheni', 'Soroca', 'Comrat'];
const STARI = ['În examinare', 'Aprobată', 'Respinsă'];
const CERERI: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: NUME[i % NUME.length],
  localitate: LOCALITATI[(i * 3 + Math.floor(i / NUME.length)) % LOCALITATI.length],
  depusa: `2026-0${8 + (i % 2)}-${String((i % 28) + 1).padStart(2, '0')}`,
  suma: ((i * 137) % 1900) + 50,
  stare: STARI[i % STARI.length],
}));

@Component({
  selector: 'app-table-paginated',
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
    MudPagination,
  ],
  template: `
    <div class="mud-data-table-container" tabindex="0">
      <!-- re-sorting goes back to page 1; drop the handler to keep the current page -->
      <table
        mud-table
        [dataSource]="source"
        mudSort
        (sortChange)="paginator().firstPage()"
        aria-label="Cereri depuse"
      >
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">
            Nume
          </th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">
            Localitate
          </th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
        </ng-container>
        <ng-container mudColumnDef="depusa">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">
            Depusă la
          </th>
          <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th
            mud-header-cell
            *mudHeaderCellDef
            mud-sort-header
            start="desc"
            sortActionDescription="Sortează"
          >
            Suma (MDL)
          </th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
    <mud-pagination [pageSize]="10" style="justify-content: flex-end; margin-block-start: 16px" />
  `,
})
export class TablePaginatedExample {
  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  // Sorts, then slices one page; it also keeps the paginator's length up to date.
  readonly source = new MudTableDataSource(CERERI);
  readonly sort = viewChild.required(MudSort);
  readonly paginator = viewChild.required(MudPagination);

  constructor() {
    afterNextRender(() => {
      this.source.sort = this.sort();
      this.source.paginator = this.paginator();
    });
  }
}
