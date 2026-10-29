import { Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { MudSpinner } from 'ngx-mud-ui/spinner';
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
  MudSort,
  MudSortHeader,
} from 'ngx-mud-ui/table';
import type { MudSortState } from 'ngx-mud-ui/table';

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

interface CereriPage {
  items: Cerere[];
  total: number;
}

const EMPTY_PAGE: CereriPage = { items: [], total: 0 };

// DEMO ONLY — stands in for the backend so the story runs without a server. Register it
// where HttpClient is provided (app.config.ts):
//   provideHttpClient(withInterceptors([fakeCereriPageApi]))
// In a real app keep provideHttpClient() and delete the interceptor; the component below does not change.
export const fakeCereriPageApi: HttpInterceptorFn = (req, next) => {
  if (!req.url.endsWith('/api/cereri/page')) return next(req);

  const active = req.params.get('sort') ?? '';
  const direction = req.params.get('dir') ?? '';
  const page = Number(req.params.get('page') ?? 0);
  const size = Number(req.params.get('size') ?? 10);
  const sorted = [...CERERI].sort((a, b) => {
    if (!active || !direction) return 0;

    const valueA = a[active as keyof Cerere];
    const valueB = b[active as keyof Cerere];
    const order =
      typeof valueA === 'string' && typeof valueB === 'string'
        ? valueA.localeCompare(valueB, 'ro')
        : valueA === valueB
          ? 0
          : valueA > valueB
            ? 1
            : -1;

    return direction === 'asc' ? order : -order;
  });
  const body: CereriPage = {
    items: sorted.slice(page * size, page * size + size),
    total: sorted.length,
  };

  return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
};

@Component({
  selector: 'app-table-server-paging',
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
    MudSort,
    MudSortHeader,
    MudPagination,
    MudSpinner,
  ],
  template: `
    <!-- the server sorts and pages, so no MudTableDataSource: bind the current page's rows -->
    <div class="mud-data-table-container" tabindex="0">
      <table
        mud-table
        [dataSource]="shown().items"
        mudSort
        (sortChange)="onSort($event)"
        [attr.aria-busy]="page.isLoading() ? 'true' : null"
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
        <tr *mudNoDataRow>
          <td [attr.colspan]="columns.length">
            @if (page.isLoading()) {
              <mud-spinner size="sm" aria-label="Se încarcă cererile" />
            } @else if (page.error()) {
              Nu am putut încărca cererile. Încearcă din nou.
            } @else {
              Nu există cereri depuse.
            }
          </td>
        </tr>
      </table>
    </div>
    <!-- length is the server's total; (pageIndex) drives the request -->
    <mud-pagination
      [length]="shown().total"
      [pageSize]="pageSize"
      [(pageIndex)]="pageIndex"
      [disabled]="page.isLoading()"
      style="justify-content: flex-end; margin-block-start: 16px"
    />
  `,
})
export class TableServerPagingExample {
  private readonly _http = inject(HttpClient);

  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  readonly pageSize = 10;
  readonly sort = signal<MudSortState>({ active: '', direction: '' });
  readonly pageIndex = signal(0);
  // Re-runs the request whenever the sort or the page changes.
  readonly page = rxResource({
    params: () => ({ sort: this.sort(), pageIndex: this.pageIndex() }),
    stream: ({ params }) =>
      this._http.get<CereriPage>('/api/cereri/page', {
        params: {
          sort: params.sort.active,
          dir: params.sort.direction,
          page: params.pageIndex,
          size: this.pageSize,
        },
      }),
    defaultValue: EMPTY_PAGE,
  });
  // rxResource shows defaultValue while a new page loads; keep the last page so rows and paginator don't collapse.
  readonly shown = linkedSignal<CereriPage | undefined, CereriPage>({
    source: () => (this.page.status() === 'resolved' ? this.page.value() : undefined),
    computation: (next, previous) => next ?? previous?.value ?? EMPTY_PAGE,
  });

  onSort(state: MudSortState): void {
    this.sort.set(state);
    this.pageIndex.set(0);
  }
}
