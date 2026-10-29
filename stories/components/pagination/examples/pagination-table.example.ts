import { afterNextRender, Component, viewChild } from '@angular/core';
import { MudPagination } from 'ngx-mud-ui/pagination';
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
  id: number;
  nume: string;
  suma: number;
}

const CERERI: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: ['Ana Rusu', 'Ion Ceban', 'Maria Popescu', 'Victor Lungu', 'Elena Cojocaru'][i % 5],
  suma: ((i * 37) % 900) + 100,
}));

@Component({
  selector: 'app-pagination-table',
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
    <div class="mud-data-table-container">
      <!-- re-sorting goes back to page 1; drop the handler to keep the current page -->
      <table
        mud-table
        [dataSource]="source"
        mudSort
        (sortChange)="paginator().firstPage()"
        aria-label="Cereri depuse"
      >
        <ng-container mudColumnDef="id">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nr.</th>
          <td mud-cell *mudCellDef="let row">{{ row.id }}</td>
        </ng-container>
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Suma</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
    <mud-pagination [pageSize]="5" />
  `,
  styles: `
    /* The paginator is a block-level flex container: justify-content aligns it. */
    mud-pagination {
      justify-content: flex-end;
      margin-block-start: 16px;
    }
  `,
})
export class PaginationTableExample {
  readonly columns = ['id', 'nume', 'suma'];
  // Sorts, then slices one page; it also keeps the paginator's length up to date.
  readonly source = new MudTableDataSource(CERERI);
  readonly sort = viewChild.required(MudSort);
  readonly paginator = viewChild.required(MudPagination);

  constructor() {
    // viewChild resolves after the first render, so hand both over then.
    afterNextRender(() => {
      this.source.sort = this.sort();
      this.source.paginator = this.paginator();
    });
  }
}
