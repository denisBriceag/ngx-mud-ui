import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { delay, of } from 'rxjs';
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

const CERERI: Cerere[] = [
  {
    id: 1,
    nume: 'Ana Rusu',
    localitate: 'Chișinău',
    depusa: '2026-09-01',
    suma: 250,
    stare: 'În examinare',
  },
  {
    id: 2,
    nume: 'Ion Ceban',
    localitate: 'Bălți',
    depusa: '2026-08-28',
    suma: 1200,
    stare: 'Aprobată',
  },
  {
    id: 3,
    nume: 'Maria Popescu',
    localitate: 'Cahul',
    depusa: '2026-09-10',
    suma: 80,
    stare: 'Respinsă',
  },
  {
    id: 4,
    nume: 'Vasile Lungu',
    localitate: 'Orhei',
    depusa: '2026-09-05',
    suma: 640,
    stare: 'Aprobată',
  },
  {
    id: 5,
    nume: 'Elena Moraru',
    localitate: 'Ungheni',
    depusa: '2026-08-30',
    suma: 310,
    stare: 'În examinare',
  },
];

// DEMO ONLY — stands in for the backend so the story runs without a server. Register it
// where HttpClient is provided (app.config.ts):
//   provideHttpClient(withInterceptors([fakeCereriApi]))
// In a real app keep provideHttpClient() and delete the interceptor; the component below does not change.
export const fakeCereriApi: HttpInterceptorFn = (req, next) => {
  if (!req.url.endsWith('/api/cereri')) return next(req);

  const active = req.params.get('sort') ?? '';
  const direction = req.params.get('dir') ?? '';
  const body = [...CERERI].sort((a, b) => {
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

  return of(new HttpResponse({ status: 200, body })).pipe(delay(700));
};

@Component({
  selector: 'app-table-http',
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
    MudSpinner,
  ],
  template: `
    <!-- rows come from the server already sorted, so no MudTableDataSource: bind the array -->
    <table
      mud-table
      [dataSource]="rows.value()"
      mudSort
      (sortChange)="sort.set($event)"
      [attr.aria-busy]="rows.isLoading() ? 'true' : null"
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
      <!-- the no-data row doubles as the loading and error state -->
      <tr *mudNoDataRow>
        <td [attr.colspan]="columns.length">
          @if (rows.isLoading()) {
            <mud-spinner size="sm" aria-label="Se încarcă cererile" />
          } @else if (rows.error()) {
            Nu am putut încărca cererile. Încearcă din nou.
          } @else {
            Nu există cereri depuse.
          }
        </td>
      </tr>
    </table>
    <p aria-live="polite">
      {{ rows.isLoading() ? 'Se încarcă…' : rows.value().length + ' cereri' }}
    </p>
  `,
})
export class TableHttpExample {
  private readonly _http = inject(HttpClient);

  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  readonly sort = signal<MudSortState>({ active: '', direction: '' });
  // Re-runs the request whenever the sort changes; the server returns the rows already ordered.
  readonly rows = rxResource({
    params: () => this.sort(),
    stream: ({ params }) =>
      this._http.get<Cerere[]>('/api/cereri', {
        params: { sort: params.active, dir: params.direction },
      }),
    defaultValue: [] as Cerere[],
  });
}
