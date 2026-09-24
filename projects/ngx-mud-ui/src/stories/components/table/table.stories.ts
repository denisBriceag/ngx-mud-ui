import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { afterNextRender, ChangeDetectionStrategy, Component, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MudSpinner } from 'ngx-mud-ui/spinner';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudTag } from 'ngx-mud-ui/tag';
import { MudIconButton } from 'ngx-mud-ui/button';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { edit, MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';
import {
  MudCell,
  MudCellDef,
  MudColumnDef,
  MudFooterCell,
  MudFooterCellDef,
  MudFooterRow,
  MudFooterRowDef,
  MudHeaderCell,
  MudHeaderCellDef,
  MudHeaderRow,
  MudHeaderRowDef,
  MudNoDataRow,
  MudRow,
  MudRowDef,
  MudSort,
  MudSortHeader,
  MudTable,
  MudTableDataSource,
} from 'ngx-mud-ui/table';
import type { MudSortDirection, MudSortState, MudTableHeaderStyle, MudTableRowStyle } from 'ngx-mud-ui/table';

interface Cerere {
  id: number;
  nume: string;
  localitate: string;
  depusa: string;
  suma: number;
  stare: string;
}

const CERERI: Cerere[] = [
  { id: 1, nume: 'Ana Rusu', localitate: 'Chișinău', depusa: '2026-09-01', suma: 250, stare: 'În examinare' },
  { id: 2, nume: 'Ion Ceban', localitate: 'Bălți', depusa: '2026-08-28', suma: 1200, stare: 'Aprobată' },
  { id: 3, nume: 'Maria Popescu', localitate: 'Cahul', depusa: '2026-09-10', suma: 80, stare: 'Respinsă' },
  { id: 4, nume: 'Vasile Lungu', localitate: 'Orhei', depusa: '2026-09-05', suma: 640, stare: 'Aprobată' },
  { id: 5, nume: 'Elena Moraru', localitate: 'Ungheni', depusa: '2026-08-30', suma: 310, stare: 'În examinare' },
];

const COLUMNS = ['nume', 'localitate', 'depusa', 'suma'];

// 47 generated requests for the pagination stories (five rows would fit on one page).
const NUME = ['Ana Rusu', 'Ion Ceban', 'Maria Popescu', 'Vasile Lungu', 'Elena Moraru', 'Victor Cojocaru', 'Natalia Grosu'];
const LOCALITATI = ['Chișinău', 'Bălți', 'Cahul', 'Orhei', 'Ungheni', 'Soroca', 'Comrat'];
const STARI = ['În examinare', 'Aprobată', 'Respinsă'];
const CERERI_MANY: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: NUME[i % NUME.length],
  localitate: LOCALITATI[(i * 3 + Math.floor(i / NUME.length)) % LOCALITATI.length],
  depusa: `2026-0${String(8 + (i % 2))}-${String((i % 28) + 1).padStart(2, '0')}`,
  suma: ((i * 137) % 1900) + 50,
  stare: STARI[i % STARI.length],
}));

const TABLE_IMPORTS = [
  MudTable,
  MudColumnDef,
  MudHeaderCellDef,
  MudCellDef,
  MudFooterCellDef,
  MudHeaderCell,
  MudCell,
  MudFooterCell,
  MudHeaderRowDef,
  MudRowDef,
  MudFooterRowDef,
  MudHeaderRow,
  MudRow,
  MudFooterRow,
  MudNoDataRow,
  MudSort,
  MudSortHeader,
];

interface PlaygroundArgs {
  headerStyle: MudTableHeaderStyle;
  rowStyle: MudTableRowStyle;
  hoverable: boolean;
  active: string;
  direction: MudSortDirection;
  start: 'asc' | 'desc';
  disableClear: boolean;
  disabled: boolean;
}

/** Story-only host: wires a MudTableDataSource to the table's MudSort. Name is globally unique on purpose. */
@Component({
  selector: 'mud-table-story-playground',
  imports: TABLE_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mud-data-table-container" tabindex="0">
      <table
        mud-table
        [dataSource]="source"
        [headerStyle]="headerStyle()"
        [rowStyle]="rowStyle()"
        [hoverable]="hoverable()"
        mudSort
        [active]="active()"
        [direction]="direction()"
        [start]="start()"
        [disableClear]="disableClear()"
        [disabled]="disabled()"
        (sortChange)="sortChange.emit($event)"
        aria-label="Cereri depuse"
      >
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
        </ng-container>
        <ng-container mudColumnDef="depusa">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
          <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
  `,
})
class TableStoryPlayground {
  readonly headerStyle = input<MudTableHeaderStyle>('subtle');
  readonly rowStyle = input<MudTableRowStyle>('default');
  readonly hoverable = input(false);
  readonly active = input('');
  readonly direction = input<MudSortDirection>('');
  readonly start = input<'asc' | 'desc'>('asc');
  readonly disableClear = input(false);
  readonly disabled = input(false);
  readonly sortChange = output<MudSortState>();

  readonly columns = COLUMNS;
  readonly source = new MudTableDataSource(CERERI);
  readonly sort = viewChild.required(MudSort);

  constructor() {
    afterNextRender(() => {
      this.source.sort = this.sort();
    });
  }
}

/** Story-only host for the selection recipe. */
@Component({
  selector: 'mud-table-story-selection',
  imports: [...TABLE_IMPORTS, MudCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table mud-table [dataSource]="rows" rowStyle="zebra" hoverable aria-label="Cereri de aprobat">
      <ng-container mudColumnDef="select">
        <th mud-header-cell *mudHeaderCellDef class="mud-data-table__selection-cell">
          <mud-checkbox
            size="small"
            [checked]="allSelected()"
            [indeterminate]="someSelected()"
            (checkedChange)="toggleAll()"
            aria-label="Selectează toate rândurile"
          />
        </th>
        <td mud-cell *mudCellDef="let row" class="mud-data-table__selection-cell">
          <mud-checkbox
            size="small"
            [checked]="selection.isSelected(row)"
            (checkedChange)="toggle(row)"
            [aria-label]="'Selectează ' + row.nume"
          />
        </td>
      </ng-container>
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef>Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <ng-container mudColumnDef="stare">
        <th mud-header-cell *mudHeaderCellDef>Stare</th>
        <td mud-cell *mudCellDef="let row">{{ row.stare }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns" [selected]="selection.isSelected(row)"></tr>
    </table>
    <p class="mud-table-story-selection__count">Selectate: {{ count() }}</p>
  `,
})
class TableStorySelection {
  readonly columns = ['select', 'nume', 'stare'];
  readonly rows = CERERI;
  readonly selection = new SelectionModel<Cerere>(true, []);
  readonly count = signal(0);
  readonly allSelected = signal(false);
  readonly someSelected = signal(false);

  toggle(row: Cerere): void {
    this.selection.toggle(row);
    this._refresh();
  }

  toggleAll(): void {
    if (this.selection.selected.length === this.rows.length) {
      this.selection.clear();
    } else {
      this.selection.select(...this.rows);
    }

    this._refresh();
  }

  private _refresh(): void {
    const selected = this.selection.selected.length;

    this.count.set(selected);
    this.allSelected.set(selected === this.rows.length);
    this.someSelected.set(selected > 0 && selected < this.rows.length);
  }
}

/** Sorts demo rows the way the fake backends do: strings by Romanian collation, empty sort = original order. */
function sortCereri(rows: Cerere[], active: string, direction: string): Cerere[] {
  return [...rows].sort((a, b) => {
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
}

/** Demo backend: answers GET /api/cereri from the sample rows, sorted by ?sort=&dir=, after 700ms. */
const fakeCereriApi: HttpInterceptorFn = (req, next) => {
  if (!req.url.endsWith('/api/cereri')) return next(req);

  const body = sortCereri(CERERI, req.params.get('sort') ?? '', req.params.get('dir') ?? '');

  return of(new HttpResponse({ status: 200, body })).pipe(delay(700));
};

interface CereriPage {
  items: Cerere[];
  total: number;
}

const EMPTY_PAGE: CereriPage = { items: [], total: 0 };

/** Demo backend: GET /api/cereri/page?sort=&dir=&page=&size= returns one sorted page plus the total, after 500ms. */
const fakeCereriPageApi: HttpInterceptorFn = (req, next) => {
  if (!req.url.endsWith('/api/cereri/page')) return next(req);

  const page = Number(req.params.get('page') ?? 0);
  const size = Number(req.params.get('size') ?? 10);
  const sorted = sortCereri(CERERI_MANY, req.params.get('sort') ?? '', req.params.get('dir') ?? '');
  const body: CereriPage = { items: sorted.slice(page * size, page * size + size), total: sorted.length };

  return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
};

/** Story-only host: rows come from HttpClient, sorting is done by the "server" (re-request on sortChange). */
@Component({
  selector: 'mud-table-story-async',
  imports: [...TABLE_IMPORTS, MudSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table
      mud-table
      [dataSource]="rows.value()"
      mudSort
      (sortChange)="sort.set($event)"
      [attr.aria-busy]="rows.isLoading() ? 'true' : null"
      aria-label="Cereri depuse"
    >
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <ng-container mudColumnDef="localitate">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
        <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
      </ng-container>
      <ng-container mudColumnDef="depusa">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
        <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
        <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      <tr *mudNoDataRow>
        <td [attr.colspan]="columns.length">
          @if (rows.isLoading()) {
            <mud-spinner size="small" aria-label="Se încarcă cererile" />
          } @else if (rows.error()) {
            Nu am putut încărca cererile. Încearcă din nou.
          } @else {
            Nu există cereri depuse.
          }
        </td>
      </tr>
    </table>
    <p class="mud-table-story-async__status" aria-live="polite">
      {{ rows.isLoading() ? 'Se încarcă…' : rows.value().length + ' cereri' }}
    </p>
  `,
})
class TableStoryAsync {
  private readonly _http = inject(HttpClient);

  readonly columns = COLUMNS;
  readonly sort = signal<MudSortState>({ active: '', direction: '' });
  // Re-runs the request whenever the sort changes; the server returns the rows already ordered.
  readonly rows = rxResource({
    params: () => this.sort(),
    stream: ({ params }) =>
      this._http.get<Cerere[]>('/api/cereri', { params: { sort: params.active, dir: params.direction } }),
    defaultValue: [] as Cerere[],
  });
}

/** Story-only host: MudTableDataSource sorts and pages the rows in memory. */
@Component({
  selector: 'mud-table-story-paginated',
  imports: [...TABLE_IMPORTS, MudPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mud-data-table-container" tabindex="0">
      <table mud-table [dataSource]="source" mudSort (sortChange)="paginator().firstPage()" aria-label="Cereri depuse">
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
        </ng-container>
        <ng-container mudColumnDef="depusa">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
          <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    </div>
    <mud-pagination [pageSize]="10" style="justify-content: flex-end; margin-block-start: 16px" />
  `,
})
class TableStoryPaginated {
  readonly columns = COLUMNS;
  readonly source = new MudTableDataSource(CERERI_MANY);
  readonly sort = viewChild.required(MudSort);
  readonly paginator = viewChild.required(MudPagination);

  constructor() {
    afterNextRender(() => {
      this.source.sort = this.sort();
      this.source.paginator = this.paginator();
    });
  }
}

/** Story-only host: the "server" sorts and pages; the paginator only reports the page and shows the total. */
@Component({
  selector: 'mud-table-story-server-paging',
  imports: [...TABLE_IMPORTS, MudPagination, MudSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
        </ng-container>
        <ng-container mudColumnDef="depusa">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
          <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
        <tr *mudNoDataRow>
          <td [attr.colspan]="columns.length">
            @if (page.isLoading()) {
              <mud-spinner size="small" aria-label="Se încarcă cererile" />
            } @else if (page.error()) {
              Nu am putut încărca cererile. Încearcă din nou.
            } @else {
              Nu există cereri depuse.
            }
          </td>
        </tr>
      </table>
    </div>
    <mud-pagination
      [length]="shown().total"
      [pageSize]="pageSize"
      [(pageIndex)]="pageIndex"
      [disabled]="page.isLoading()"
      style="justify-content: flex-end; margin-block-start: 16px"
    />
  `,
})
class TableStoryServerPaging {
  private readonly _http = inject(HttpClient);

  readonly columns = COLUMNS;
  readonly pageSize = 10;
  readonly sort = signal<MudSortState>({ active: '', direction: '' });
  readonly pageIndex = signal(0);
  // Re-runs the request whenever the sort or the page changes.
  readonly page = rxResource({
    params: () => ({ sort: this.sort(), pageIndex: this.pageIndex() }),
    stream: ({ params }) =>
      this._http.get<CereriPage>('/api/cereri/page', {
        params: { sort: params.sort.active, dir: params.sort.direction, page: params.pageIndex, size: this.pageSize },
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

// ---------------------------------------------------------------------------
// "Show code" snippets. Every story shows a complete, pasteable Angular component:
// imports, the data type and rows, the @Component and its template.
// ---------------------------------------------------------------------------
const BT = '`';

const CERERE_INTERFACE = `interface Cerere {
  id: number;
  nume: string;
  localitate: string;
  depusa: string;
  suma: number;
  stare: string;
}`;

// Generated from the same rows the canvases render, so a pasted snippet reproduces the story.
const DATA_SNIPPET = `${CERERE_INTERFACE}

const CERERI: Cerere[] = [
${CERERI.map(
  (row) =>
    `  { id: ${String(row.id)}, nume: '${row.nume}', localitate: '${row.localitate}', depusa: '${row.depusa}', suma: ${String(row.suma)}, stare: '${row.stare}' },`,
).join('\n')}
];`;

interface SnippetOptions {
  /** Component selector, e.g. 'app-cereri'. */
  selector: string;
  className: string;
  /** Extra named imports from '@angular/core' besides Component. */
  coreImports?: string[];
  /** Symbols imported from 'ngx-mud-ui/table'. */
  tableImports: string[];
  /** Whole extra import lines (other entry points, CDK). */
  extraImportLines?: string[];
  /** Extra entries for the @Component imports array (beyond tableImports). */
  extraComponentImports?: string[];
  /** Optional `providers: [...]` value. */
  providers?: string;
  /** Component template, un-indented. */
  template: string;
  /** Class body lines (columns/rows are added unless `noData`). */
  fields?: string[];
  noData?: boolean;
  /** Extra top-level code placed between the data and the @Component. */
  beforeComponent?: string;
  /** Non-directive symbols from 'ngx-mud-ui/table' (imported, but kept out of `imports: [...]`). */
  valueImports?: string[];
  /** Emit the Cerere interface without the sample rows. */
  interfaceOnly?: boolean;
}

const indent = (text: string, spaces: number): string =>
  text
    .trim()
    .split('\n')
    .map((line) => ' '.repeat(spaces) + line)
    .join('\n');

const componentSource = (o: SnippetOptions): string => {
  const core = ['Component', ...(o.coreImports ?? [])].sort().join(', ');
  const imports = [...o.tableImports, ...(o.extraComponentImports ?? [])];
  const tableSymbols = [...o.tableImports, ...(o.valueImports ?? [])];
  const lines = [
    `import { ${core} } from '@angular/core';`,
    ...(o.extraImportLines ?? []),
    `import {\n${tableSymbols.map((name) => `  ${name},`).join('\n')}\n} from 'ngx-mud-ui/table';`,
    '',
    ...(o.noData ? [] : [o.interfaceOnly ? CERERE_INTERFACE : DATA_SNIPPET, '']),
    ...(o.beforeComponent ? [o.beforeComponent, ''] : []),
    '@Component({',
    `  selector: '${o.selector}',`,
    `  imports: [${imports.join(', ')}],`,
    ...(o.providers ? [`  providers: [${o.providers}],`] : []),
    `  template: ${BT}`,
    indent(o.template, 4),
    `  ${BT},`,
    '})',
    `export class ${o.className} {`,
    ...(o.fields ?? []),
    '}',
  ];

  return lines.join('\n');
};

const BASE_IMPORTS = ['MudTable', 'MudColumnDef', 'MudHeaderCellDef', 'MudCellDef', 'MudHeaderCell', 'MudCell', 'MudHeaderRowDef', 'MudRowDef', 'MudHeaderRow', 'MudRow'];
const ROWS_FIELDS = ["  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];", '  readonly rows = CERERI;'];

const FOUR_COLUMNS = `<ng-container mudColumnDef="nume">
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
<tr mud-row *mudRowDef="let row; columns: columns"></tr>`;

/** Playground: only inputs that differ from their defaults are written out. */
const playgroundSource = (args: PlaygroundArgs): string => {
  const tableAttrs = ['mud-table', '[dataSource]="source"'];

  if (args.headerStyle !== 'subtle') tableAttrs.push(`headerStyle="${args.headerStyle}"`);

  if (args.rowStyle !== 'default') tableAttrs.push(`rowStyle="${args.rowStyle}"`);

  if (args.hoverable) tableAttrs.push('hoverable');

  const sortAttrs = ['mudSort'];

  if (args.active) sortAttrs.push(`active="${args.active}"`);

  if (args.direction) sortAttrs.push(`direction="${args.direction}"`);

  if (args.start !== 'asc') sortAttrs.push(`start="${args.start}"`);

  if (args.disableClear) sortAttrs.push('disableClear');

  if (args.disabled) sortAttrs.push('disabled');

  return componentSource({
    selector: 'app-cereri',
    className: 'CereriComponent',
    coreImports: ['afterNextRender', 'viewChild'],
    tableImports: [...BASE_IMPORTS, 'MudSort', 'MudSortHeader'],
    valueImports: ['MudTableDataSource'],
    template: `<div class="mud-data-table-container" tabindex="0">
  <table ${tableAttrs.join(' ')}
    ${sortAttrs.join(' ')} (sortChange)="onSort($event)"
    aria-label="Cereri depuse">
    <ng-container mudColumnDef="nume">
      <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
      <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
    </ng-container>
    <ng-container mudColumnDef="localitate">
      <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
      <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
    </ng-container>
    <ng-container mudColumnDef="depusa">
      <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
      <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
    </ng-container>
    <ng-container mudColumnDef="suma">
      <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
      <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
    </ng-container>
    <tr mud-header-row *mudHeaderRowDef="columns"></tr>
    <tr mud-row *mudRowDef="let row; columns: columns"></tr>
  </table>
</div>`,
    fields: [
      "  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];",
      '  // Sorts CERERI in memory; hand it the table\'s mudSort once the view exists.',
      '  readonly source = new MudTableDataSource(CERERI);',
      '  readonly sort = viewChild.required(MudSort);',
      '',
      '  constructor() {',
      '    afterNextRender(() => {',
      '      this.source.sort = this.sort();',
      '    });',
      '  }',
      '',
      '  onSort(state: MudSortState): void {',
      "    console.log('sorted by', state.active, state.direction);",
      '  }',
    ],
  }).replace("} from 'ngx-mud-ui/table';", "} from 'ngx-mud-ui/table';\nimport type { MudSortState } from 'ngx-mud-ui/table';");
};

const HEADER_STYLES_SOURCE = componentSource({
  selector: 'app-cereri-header-styles',
  className: 'CereriHeaderStylesComponent',
  tableImports: BASE_IMPORTS,
  template: `<!-- subtle (default), strong, white -->
<table mud-table [dataSource]="rows" headerStyle="strong" aria-label="Cereri depuse">
${FOUR_COLUMNS.split('\n').map((l) => '  ' + l).join('\n')}
</table>`,
  fields: ROWS_FIELDS,
});

const ROW_STYLES_SOURCE = componentSource({
  selector: 'app-cereri-row-styles',
  className: 'CereriRowStylesComponent',
  tableImports: BASE_IMPORTS,
  template: `<!-- rowStyle: default (dividers) or zebra; hoverable adds the hover background -->
<table mud-table [dataSource]="rows" rowStyle="zebra" hoverable aria-label="Cereri depuse">
${FOUR_COLUMNS.split('\n').map((l) => '  ' + l).join('\n')}
</table>`,
  fields: ROWS_FIELDS,
});

const STICKY_SOURCE = componentSource({
  selector: 'app-cereri-sticky',
  className: 'CereriStickyComponent',
  tableImports: BASE_IMPORTS,
  template: `<!-- the scroll container needs tabindex="0" so keyboard users can scroll it -->
<div class="mud-data-table-container" tabindex="0" style="max-height: 240px; overflow-y: auto">
  <table mud-table [dataSource]="rows" aria-label="Cereri depuse">
    <ng-container mudColumnDef="nume" sticky>
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
    <tr mud-header-row *mudHeaderRowDef="columns; sticky: true"></tr>
    <tr mud-row *mudRowDef="let row; columns: columns"></tr>
  </table>
</div>`,
  fields: ROWS_FIELDS,
});

const FOOTER_SOURCE = componentSource({
  selector: 'app-cereri-footer',
  className: 'CereriFooterComponent',
  tableImports: [...BASE_IMPORTS, 'MudFooterCellDef', 'MudFooterCell', 'MudFooterRowDef', 'MudFooterRow'],
  template: `<table mud-table [dataSource]="rows" aria-label="Cereri depuse">
  <ng-container mudColumnDef="nume">
    <th mud-header-cell *mudHeaderCellDef>Nume</th>
    <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
    <td mud-footer-cell *mudFooterCellDef>Total</td>
  </ng-container>
  <ng-container mudColumnDef="localitate">
    <th mud-header-cell *mudHeaderCellDef>Localitate</th>
    <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
    <td mud-footer-cell *mudFooterCellDef></td>
  </ng-container>
  <ng-container mudColumnDef="suma">
    <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
    <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
    <td mud-footer-cell *mudFooterCellDef>{{ total }}</td>
  </ng-container>
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <tr mud-row *mudRowDef="let row; columns: columns"></tr>
  <tr mud-footer-row *mudFooterRowDef="columns"></tr>
</table>`,
  fields: [
    "  readonly columns = ['nume', 'localitate', 'suma'];",
    '  readonly rows = CERERI;',
    '  readonly total = CERERI.reduce((sum, row) => sum + row.suma, 0);',
  ],
});

const EMPTY_SOURCE = componentSource({
  selector: 'app-cereri-empty',
  className: 'CereriEmptyComponent',
  tableImports: [...BASE_IMPORTS, 'MudNoDataRow'],
  template: `<table mud-table [dataSource]="rows" aria-label="Cereri depuse">
${FOUR_COLUMNS.split('\n').slice(0, -2).map((l) => '  ' + l).join('\n')}
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <tr mud-row *mudRowDef="let row; columns: columns"></tr>
  <!-- rendered only while the data source is empty; span every column -->
  <tr *mudNoDataRow>
    <td [attr.colspan]="columns.length">Nu există cereri depuse.</td>
  </tr>
</table>`,
  interfaceOnly: true,
  fields: ["  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];", '  readonly rows: Cerere[] = [];'],
});

const FLEX_SOURCE = componentSource({
  selector: 'app-cereri-flex',
  className: 'CereriFlexComponent',
  tableImports: BASE_IMPORTS,
  template: `<!-- same API on custom elements when a native <table> is not an option -->
<mud-table [dataSource]="rows" rowStyle="zebra" aria-label="Cereri depuse">
  <ng-container mudColumnDef="nume">
    <mud-header-cell *mudHeaderCellDef>Nume</mud-header-cell>
    <mud-cell *mudCellDef="let row">{{ row.nume }}</mud-cell>
  </ng-container>
  <ng-container mudColumnDef="localitate">
    <mud-header-cell *mudHeaderCellDef>Localitate</mud-header-cell>
    <mud-cell *mudCellDef="let row">{{ row.localitate }}</mud-cell>
  </ng-container>
  <ng-container mudColumnDef="suma">
    <mud-header-cell *mudHeaderCellDef>Suma (MDL)</mud-header-cell>
    <mud-cell *mudCellDef="let row">{{ row.suma }}</mud-cell>
  </ng-container>
  <mud-header-row *mudHeaderRowDef="columns"></mud-header-row>
  <mud-row *mudRowDef="let row; columns: columns"></mud-row>
</mud-table>`,
  fields: ["  readonly columns = ['nume', 'localitate', 'suma'];", '  readonly rows = CERERI;'],
});

const SELECTION_SOURCE = componentSource({
  selector: 'app-cereri-selection',
  className: 'CereriSelectionComponent',
  coreImports: ['signal'],
  extraImportLines: ["import { SelectionModel } from '@angular/cdk/collections';", "import { MudCheckbox } from 'ngx-mud-ui/checkbox';"],
  tableImports: BASE_IMPORTS,
  extraComponentImports: ['MudCheckbox'],
  template: `<!-- a selection column is an ordinary column: a mud-checkbox per row + a CDK SelectionModel -->
<table mud-table [dataSource]="rows" rowStyle="zebra" hoverable aria-label="Cereri de aprobat">
  <ng-container mudColumnDef="select">
    <th mud-header-cell *mudHeaderCellDef class="mud-data-table__selection-cell">
      <mud-checkbox
        size="small"
        [checked]="allSelected()"
        [indeterminate]="someSelected()"
        (checkedChange)="toggleAll()"
        aria-label="Selectează toate rândurile"
      />
    </th>
    <td mud-cell *mudCellDef="let row" class="mud-data-table__selection-cell">
      <mud-checkbox
        size="small"
        [checked]="selection.isSelected(row)"
        (checkedChange)="toggle(row)"
        [aria-label]="'Selectează ' + row.nume"
      />
    </td>
  </ng-container>
  <ng-container mudColumnDef="nume">
    <th mud-header-cell *mudHeaderCellDef>Nume</th>
    <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
  </ng-container>
  <ng-container mudColumnDef="stare">
    <th mud-header-cell *mudHeaderCellDef>Stare</th>
    <td mud-cell *mudCellDef="let row">{{ row.stare }}</td>
  </ng-container>
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <!-- [selected] paints the row in the brand selection colour and sets aria-selected -->
  <tr mud-row *mudRowDef="let row; columns: columns" [selected]="selection.isSelected(row)"></tr>
</table>`,
  fields: [
    "  readonly columns = ['select', 'nume', 'stare'];",
    '  readonly rows = CERERI;',
    '  readonly selection = new SelectionModel<Cerere>(true, []);',
    '  readonly allSelected = signal(false);',
    '  readonly someSelected = signal(false);',
    '',
    '  toggle(row: Cerere): void {',
    '    this.selection.toggle(row);',
    '    this.refresh();',
    '  }',
    '',
    '  toggleAll(): void {',
    '    if (this.selection.selected.length === this.rows.length) {',
    '      this.selection.clear();',
    '    } else {',
    '      this.selection.select(...this.rows);',
    '    }',
    '',
    '    this.refresh();',
    '  }',
    '',
    '  private refresh(): void {',
    '    const selected = this.selection.selected.length;',
    '',
    '    this.allSelected.set(selected === this.rows.length);',
    '    this.someSelected.set(selected > 0 && selected < this.rows.length);',
    '  }',
  ],
});

const STATUS_TAGS_SOURCE = componentSource({
  selector: 'app-cereri-status',
  className: 'CereriStatusComponent',
  extraImportLines: ["import { MudTag } from 'ngx-mud-ui/tag';", "import type { MudTagColor } from 'ngx-mud-ui/tag';"],
  tableImports: BASE_IMPORTS,
  extraComponentImports: ['MudTag'],
  template: `<table mud-table [dataSource]="rows" aria-label="Cereri depuse">
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
  <!-- any component can live in a cell: map each state to a tag colour -->
  <ng-container mudColumnDef="stare">
    <th mud-header-cell *mudHeaderCellDef>Stare</th>
    <td mud-cell *mudCellDef="let row">
      <mud-tag size="small" [color]="stateColor[row.stare]">{{ row.stare }}</mud-tag>
    </td>
  </ng-container>
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <tr mud-row *mudRowDef="let row; columns: columns"></tr>
</table>`,
  fields: [
    "  readonly columns = ['nume', 'localitate', 'depusa', 'stare'];",
    '  readonly rows = CERERI;',
    '  readonly stateColor: Record<string, MudTagColor> = {',
    "    'Aprobată': 'success',",
    "    'Respinsă': 'danger',",
    "    'În examinare': 'info',",
    '  };',
  ],
});

const ROW_ACTIONS_SOURCE = componentSource({
  selector: 'app-cereri-actions',
  className: 'CereriActionsComponent',
  extraImportLines: [
    "import { MudIconButton } from 'ngx-mud-ui/button';",
    "import { edit, MudIconComponent, provideMudIcons } from 'ngx-mud-ui/icons';",
  ],
  tableImports: BASE_IMPORTS,
  extraComponentImports: ['MudIconButton', 'MudIconComponent'],
  providers: 'provideMudIcons([edit])',
  template: `<table mud-table [dataSource]="rows" aria-label="Cereri depuse">
  <ng-container mudColumnDef="nume">
    <th mud-header-cell *mudHeaderCellDef>Nume</th>
    <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
  </ng-container>
  <ng-container mudColumnDef="localitate">
    <th mud-header-cell *mudHeaderCellDef>Localitate</th>
    <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
  </ng-container>
  <ng-container mudColumnDef="suma">
    <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
    <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
  </ng-container>
  <!-- small icon button (32px) + the actions-cell helper (4px block padding) keep the row at 40px -->
  <ng-container mudColumnDef="actiuni">
    <th mud-header-cell *mudHeaderCellDef class="mud-data-table__actions-cell" style="width: 96px">Acțiuni</th>
    <td mud-cell *mudCellDef="let row" class="mud-data-table__actions-cell">
      <button type="button" mudIconButton size="small" [attr.aria-label]="'Editează ' + row.nume" (click)="edit(row)">
        <mud-icon name="edit" [scale]="16" />
      </button>
    </td>
  </ng-container>
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <tr mud-row *mudRowDef="let row; columns: columns"></tr>
</table>`,
  fields: [
    "  readonly columns = ['nume', 'localitate', 'suma', 'actiuni'];",
    '  readonly rows = CERERI;',
    '',
    '  edit(row: Cerere): void {',
    "    console.log('edit', row.id);",
    '  }',
  ],
});

const ASYNC_SOURCE = componentSource({
  selector: 'app-cereri-async',
  className: 'CereriAsyncComponent',
  coreImports: ['inject', 'signal'],
  extraImportLines: [
    "import { rxResource } from '@angular/core/rxjs-interop';",
    "import { HttpClient, HttpResponse } from '@angular/common/http';",
    "import type { HttpInterceptorFn } from '@angular/common/http';",
    "import { delay, of } from 'rxjs';",
    "import { MudSpinner } from 'ngx-mud-ui/spinner';",
  ],
  tableImports: [...BASE_IMPORTS, 'MudNoDataRow', 'MudSort', 'MudSortHeader'],
  extraComponentImports: ['MudSpinner'],
  beforeComponent: `// DEMO ONLY — stands in for the backend so the story runs without a server. Register it
// where HttpClient is provided (app.config.ts):
//   provideHttpClient(withInterceptors([fakeCereriApi]))
// In a real app keep provideHttpClient() and delete the interceptor; the component below does not change.
const fakeCereriApi: HttpInterceptorFn = (req, next) => {
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
};`,
  template: `<!-- rows come from the server already sorted, so no MudTableDataSource: bind the array -->
<table
  mud-table
  [dataSource]="rows.value()"
  mudSort
  (sortChange)="sort.set($event)"
  [attr.aria-busy]="rows.isLoading() ? 'true' : null"
  aria-label="Cereri depuse"
>
  <ng-container mudColumnDef="nume">
    <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
    <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
  </ng-container>
  <ng-container mudColumnDef="localitate">
    <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
    <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
  </ng-container>
  <ng-container mudColumnDef="depusa">
    <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
    <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
  </ng-container>
  <ng-container mudColumnDef="suma">
    <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
    <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
  </ng-container>
  <tr mud-header-row *mudHeaderRowDef="columns"></tr>
  <tr mud-row *mudRowDef="let row; columns: columns"></tr>
  <!-- the no-data row doubles as the loading and error state -->
  <tr *mudNoDataRow>
    <td [attr.colspan]="columns.length">
      @if (rows.isLoading()) {
        <mud-spinner size="small" aria-label="Se încarcă cererile" />
      } @else if (rows.error()) {
        Nu am putut încărca cererile. Încearcă din nou.
      } @else {
        Nu există cereri depuse.
      }
    </td>
  </tr>
</table>
<p aria-live="polite">{{ rows.isLoading() ? 'Se încarcă…' : rows.value().length + ' cereri' }}</p>`,
  fields: [
    '  private readonly http = inject(HttpClient);',
    '',
    "  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];",
    "  readonly sort = signal<MudSortState>({ active: '', direction: '' });",
    '  // Re-runs the request whenever the sort changes; the server returns the rows already ordered.',
    '  readonly rows = rxResource({',
    '    params: () => this.sort(),',
    '    stream: ({ params }) =>',
    "      this.http.get<Cerere[]>('/api/cereri', { params: { sort: params.active, dir: params.direction } }),",
    '    defaultValue: [] as Cerere[],',
    '  });',
  ],
}).replace("} from 'ngx-mud-ui/table';", "} from 'ngx-mud-ui/table';\nimport type { MudSortState } from 'ngx-mud-ui/table';");

const MANY_ROWS_SNIPPET = `// 47 generated requests, enough for several pages.
const NUME = ['Ana Rusu', 'Ion Ceban', 'Maria Popescu', 'Vasile Lungu', 'Elena Moraru', 'Victor Cojocaru', 'Natalia Grosu'];
const LOCALITATI = ['Chișinău', 'Bălți', 'Cahul', 'Orhei', 'Ungheni', 'Soroca', 'Comrat'];
const STARI = ['În examinare', 'Aprobată', 'Respinsă'];
const CERERI: Cerere[] = Array.from({ length: 47 }, (_v, i) => ({
  id: i + 1,
  nume: NUME[i % NUME.length],
  localitate: LOCALITATI[(i * 3 + Math.floor(i / NUME.length)) % LOCALITATI.length],
  depusa: ${BT}2026-0\${8 + (i % 2)}-\${String((i % 28) + 1).padStart(2, '0')}${BT},
  suma: ((i * 137) % 1900) + 50,
  stare: STARI[i % STARI.length],
}));`;

const SORTABLE_COLUMNS = `<ng-container mudColumnDef="nume">
  <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Nume</th>
  <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
</ng-container>
<ng-container mudColumnDef="localitate">
  <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Localitate</th>
  <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
</ng-container>
<ng-container mudColumnDef="depusa">
  <th mud-header-cell *mudHeaderCellDef mud-sort-header sortActionDescription="Sortează">Depusă la</th>
  <td mud-cell *mudCellDef="let row">{{ row.depusa }}</td>
</ng-container>
<ng-container mudColumnDef="suma">
  <th mud-header-cell *mudHeaderCellDef mud-sort-header start="desc" sortActionDescription="Sortează">Suma (MDL)</th>
  <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
</ng-container>
<tr mud-header-row *mudHeaderRowDef="columns"></tr>
<tr mud-row *mudRowDef="let row; columns: columns"></tr>`;

const PAGINATED_SOURCE = componentSource({
  selector: 'app-cereri-paginated',
  className: 'CereriPaginatedComponent',
  coreImports: ['afterNextRender', 'viewChild'],
  extraImportLines: ["import { MudPagination } from 'ngx-mud-ui/pagination';"],
  tableImports: [...BASE_IMPORTS, 'MudSort', 'MudSortHeader'],
  extraComponentImports: ['MudPagination'],
  valueImports: ['MudTableDataSource'],
  interfaceOnly: true,
  beforeComponent: MANY_ROWS_SNIPPET,
  template: `<div class="mud-data-table-container" tabindex="0">
  <!-- re-sorting goes back to page 1; drop the handler to keep the current page -->
  <table mud-table [dataSource]="source" mudSort (sortChange)="paginator().firstPage()" aria-label="Cereri depuse">
${indent(SORTABLE_COLUMNS, 4)}
  </table>
</div>
<mud-pagination [pageSize]="10" style="justify-content: flex-end; margin-block-start: 16px" />`,
  fields: [
    "  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];",
    '  // Sorts, then slices one page; it also keeps the paginator\'s length up to date.',
    '  readonly source = new MudTableDataSource(CERERI);',
    '  readonly sort = viewChild.required(MudSort);',
    '  readonly paginator = viewChild.required(MudPagination);',
    '',
    '  constructor() {',
    '    afterNextRender(() => {',
    '      this.source.sort = this.sort();',
    '      this.source.paginator = this.paginator();',
    '    });',
    '  }',
  ],
});

const SERVER_PAGING_SOURCE = componentSource({
  selector: 'app-cereri-server-paging',
  className: 'CereriServerPagingComponent',
  coreImports: ['inject', 'linkedSignal', 'signal'],
  extraImportLines: [
    "import { rxResource } from '@angular/core/rxjs-interop';",
    "import { HttpClient, HttpResponse } from '@angular/common/http';",
    "import type { HttpInterceptorFn } from '@angular/common/http';",
    "import { delay, of } from 'rxjs';",
    "import { MudPagination } from 'ngx-mud-ui/pagination';",
    "import { MudSpinner } from 'ngx-mud-ui/spinner';",
  ],
  tableImports: [...BASE_IMPORTS, 'MudNoDataRow', 'MudSort', 'MudSortHeader'],
  extraComponentImports: ['MudPagination', 'MudSpinner'],
  interfaceOnly: true,
  beforeComponent: `${MANY_ROWS_SNIPPET}

interface CereriPage {
  items: Cerere[];
  total: number;
}

const EMPTY_PAGE: CereriPage = { items: [], total: 0 };

// DEMO ONLY — stands in for the backend so the story runs without a server. Register it
// where HttpClient is provided (app.config.ts):
//   provideHttpClient(withInterceptors([fakeCereriPageApi]))
// In a real app keep provideHttpClient() and delete the interceptor; the component below does not change.
const fakeCereriPageApi: HttpInterceptorFn = (req, next) => {
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
  const body: CereriPage = { items: sorted.slice(page * size, page * size + size), total: sorted.length };
  return of(new HttpResponse({ status: 200, body })).pipe(delay(500));
};`,
  template: `<!-- the server sorts and pages, so no MudTableDataSource: bind the current page's rows -->
<div class="mud-data-table-container" tabindex="0">
  <table
    mud-table
    [dataSource]="shown().items"
    mudSort
    (sortChange)="onSort($event)"
    [attr.aria-busy]="page.isLoading() ? 'true' : null"
    aria-label="Cereri depuse"
  >
${indent(SORTABLE_COLUMNS, 4)}
    <tr *mudNoDataRow>
      <td [attr.colspan]="columns.length">
        @if (page.isLoading()) {
          <mud-spinner size="small" aria-label="Se încarcă cererile" />
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
/>`,
  fields: [
    '  private readonly http = inject(HttpClient);',
    '',
    "  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];",
    '  readonly pageSize = 10;',
    "  readonly sort = signal<MudSortState>({ active: '', direction: '' });",
    '  readonly pageIndex = signal(0);',
    '  // Re-runs the request whenever the sort or the page changes.',
    '  readonly page = rxResource({',
    '    params: () => ({ sort: this.sort(), pageIndex: this.pageIndex() }),',
    '    stream: ({ params }) =>',
    "      this.http.get<CereriPage>('/api/cereri/page', {",
    '        params: { sort: params.sort.active, dir: params.sort.direction, page: params.pageIndex, size: this.pageSize },',
    '      }),',
    '    defaultValue: EMPTY_PAGE,',
    '  });',
    "  // rxResource shows defaultValue while a new page loads; keep the last page so rows and paginator don't collapse.",
    '  readonly shown = linkedSignal<CereriPage | undefined, CereriPage>({',
    "    source: () => (this.page.status() === 'resolved' ? this.page.value() : undefined),",
    '    computation: (next, previous) => next ?? previous?.value ?? EMPTY_PAGE,',
    '  });',
    '',
    '  onSort(state: MudSortState): void {',
    '    this.sort.set(state);',
    '    this.pageIndex.set(0);',
    '  }',
  ],
}).replace("} from 'ngx-mud-ui/table';", "} from 'ngx-mud-ui/table';\nimport type { MudSortState } from 'ngx-mud-ui/table';");

/** Render helper for the HeaderStyles/RowStyles stories (not a snippet). */
const STATIC_TABLE = (attrs: string): string => `
  <table mud-table [dataSource]="rows" ${attrs} aria-label="Cereri depuse">
${FOUR_COLUMNS.split('\n')
  .map((line) => '    ' + line)
  .join('\n')}
  </table>`;

const meta: Meta<PlaygroundArgs> = {
  title: 'Components/Table',
  component: MudTable,
  decorators: [
    moduleMetadata({
      imports: [
        ...TABLE_IMPORTS,
        TableStoryPlayground,
        TableStorySelection,
        TableStoryAsync,
        TableStoryPaginated,
        TableStoryServerPaging,
        MudTag,
        MudIconButton,
        MudIconComponent,
      ],
    }),
    // The StatusTags/RowActions recipes render <mud-icon>; the registry is consumer-populated.
    // HttpClient + the demo interceptors back the AsyncData and ServerPaging stories (environment providers, so app level).
    applicationConfig({ providers: [provideMudIcons([edit]), provideHttpClient(withInterceptors([fakeCereriApi, fakeCereriPageApi]))] }),
  ],
  argTypes: {
    headerStyle: { control: 'inline-radio', options: ['subtle', 'strong', 'white'] },
    rowStyle: { control: 'inline-radio', options: ['default', 'zebra'] },
    hoverable: { control: 'boolean' },
    // '' is the unsorted state; without `labels` Storybook renders it as a blank option.
    active: { control: { type: 'select', labels: { '': 'none' } }, options: ['', 'nume', 'localitate', 'depusa', 'suma'] },
    direction: { control: { type: 'inline-radio', labels: { '': 'none' } }, options: ['', 'asc', 'desc'] },
    start: { control: 'inline-radio', options: ['asc', 'desc'] },
    disableClear: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    headerStyle: 'subtle',
    rowStyle: 'default',
    hoverable: false,
    active: '',
    direction: '',
    start: 'asc',
    disableClear: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<PlaygroundArgs>;

/** Every table and sort input bound; click a header to sort in memory. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        language: 'ts',
        transform: (_code: string, ctx: { args: PlaygroundArgs }) => playgroundSource(ctx.args),
      },
    },
  },
  render: (args) => ({
    props: { ...args, onSort: (state: MudSortState) => console.log('sortChange', state) },
    template: `
      <mud-table-story-playground
        [headerStyle]="headerStyle"
        [rowStyle]="rowStyle"
        [hoverable]="hoverable"
        [active]="active"
        [direction]="direction"
        [start]="start"
        [disableClear]="disableClear"
        [disabled]="disabled"
        (sortChange)="onSort($event)"
      />
    `,
  }),
};

/** subtle (#F1F1F1), strong (#1E1E1E) and white with a bottom line. */
export const HeaderStyles: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: HEADER_STYLES_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: CERERI.slice(0, 3), columns: COLUMNS },
    template: `
      <div style="display: grid; gap: 24px">
        ${STATIC_TABLE('headerStyle="subtle"')}
        ${STATIC_TABLE('headerStyle="strong"')}
        ${STATIC_TABLE('headerStyle="white"')}
      </div>
    `,
  }),
};

/** default keeps a 0.5px divider under every row; zebra adds alternating backgrounds. Both hoverable. */
export const RowStyles: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: ROW_STYLES_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: CERERI, columns: COLUMNS },
    template: `
      <div style="display: grid; gap: 24px">
        ${STATIC_TABLE('rowStyle="default" hoverable')}
        ${STATIC_TABLE('rowStyle="zebra" hoverable')}
      </div>
    `,
  }),
};

/** Sticky header row and a sticky first column inside a scroll container. */
export const Sticky: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: STICKY_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: [...CERERI, ...CERERI, ...CERERI].map((row, index) => ({ ...row, id: index + 1 })), columns: COLUMNS },
    template: `
      <div class="mud-data-table-container" tabindex="0" style="max-height: 240px; overflow-y: auto; max-width: 560px">
        <table mud-table [dataSource]="rows" aria-label="Cereri depuse">
          <ng-container mudColumnDef="nume" sticky>
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
          <tr mud-header-row *mudHeaderRowDef="columns; sticky: true"></tr>
          <tr mud-row *mudRowDef="let row; columns: columns"></tr>
        </table>
      </div>
    `,
  }),
};

/** Footer row with a total. */
export const Footer: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: FOOTER_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: CERERI, columns: ['nume', 'localitate', 'suma'], total: CERERI.reduce((sum, row) => sum + row.suma, 0) },
    template: `
      <table mud-table [dataSource]="rows" aria-label="Cereri depuse">
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
          <td mud-footer-cell *mudFooterCellDef>Total</td>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <th mud-header-cell *mudHeaderCellDef>Localitate</th>
          <td mud-cell *mudCellDef="let row">{{ row.localitate }}</td>
          <td mud-footer-cell *mudFooterCellDef></td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
          <td mud-footer-cell *mudFooterCellDef>{{ total }}</td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
        <tr mud-footer-row *mudFooterRowDef="columns"></tr>
      </table>
    `,
  }),
};

/** The no-data row renders while the data source is empty. */
export const Empty: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: EMPTY_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: [] as Cerere[], columns: COLUMNS },
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
        <tr *mudNoDataRow>
          <td [attr.colspan]="columns.length">Nu există cereri depuse.</td>
        </tr>
      </table>
    `,
  }),
};

/** The same API on custom elements instead of a native table. */
export const FlexLayout: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: FLEX_SOURCE, language: 'ts' } } },
  render: () => ({
    props: { rows: CERERI, columns: ['nume', 'localitate', 'suma'] },
    template: `
      <mud-table [dataSource]="rows" rowStyle="zebra" aria-label="Cereri depuse">
        <ng-container mudColumnDef="nume">
          <mud-header-cell *mudHeaderCellDef>Nume</mud-header-cell>
          <mud-cell *mudCellDef="let row">{{ row.nume }}</mud-cell>
        </ng-container>
        <ng-container mudColumnDef="localitate">
          <mud-header-cell *mudHeaderCellDef>Localitate</mud-header-cell>
          <mud-cell *mudCellDef="let row">{{ row.localitate }}</mud-cell>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <mud-header-cell *mudHeaderCellDef>Suma (MDL)</mud-header-cell>
          <mud-cell *mudCellDef="let row">{{ row.suma }}</mud-cell>
        </ng-container>
        <mud-header-row *mudHeaderRowDef="columns"></mud-header-row>
        <mud-row *mudRowDef="let row; columns: columns"></mud-row>
      </mud-table>
    `,
  }),
};

/** Recipe: a consumer selection column built from mud-checkbox and CDK's SelectionModel. */
export const SelectionRecipe: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: SELECTION_SOURCE, language: 'ts' } } },
  render: () => ({ template: `<mud-table-story-selection />` }),
};

/** Recipe: a status column rendered with mud-tag; any component can live in a cell. */
export const StatusTags: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: STATUS_TAGS_SOURCE, language: 'ts' } } },
  render: () => ({
    props: {
      rows: CERERI,
      columns: ['nume', 'localitate', 'depusa', 'stare'],
      stateColor: { Aprobată: 'success', Respinsă: 'danger', 'În examinare': 'info' } as Record<string, string>,
    },
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
        <ng-container mudColumnDef="stare">
          <th mud-header-cell *mudHeaderCellDef>Stare</th>
          <td mud-cell *mudCellDef="let row">
            <mud-tag size="small" [color]="stateColor[row.stare]">{{ row.stare }}</mud-tag>
          </td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    `,
  }),
};

/** Recipe: a trailing actions column with a small edit icon button per row, kept inside the 40px row. */
export const RowActions: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: ROW_ACTIONS_SOURCE, language: 'ts' } } },
  render: () => ({
    props: {
      rows: CERERI,
      columns: ['nume', 'localitate', 'suma', 'actiuni'],
      edit: (row: Cerere) => console.log('edit', row),
    },
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
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef>Suma (MDL)</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        </ng-container>
        <ng-container mudColumnDef="actiuni">
          <th mud-header-cell *mudHeaderCellDef class="mud-data-table__actions-cell" style="width: 96px">Acțiuni</th>
          <td mud-cell *mudCellDef="let row" class="mud-data-table__actions-cell">
            <button type="button" mudIconButton size="small" [attr.aria-label]="'Editează ' + row.nume" (click)="edit(row)">
              <mud-icon name="edit" [scale]="16" />
            </button>
          </td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns"></tr>
      </table>
    `,
  }),
};

/** Rows fetched over HttpClient with rxResource; sorting re-requests from the server. A demo interceptor stands in for the backend. */
export const AsyncData: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: ASYNC_SOURCE, language: 'ts' } } },
  render: () => ({ template: `<mud-table-story-async />` }),
};

/** MudTableDataSource sorts and pages 47 rows in memory; re-sorting returns to page 1. */
export const Paginated: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: PAGINATED_SOURCE, language: 'ts' } } },
  render: () => ({ template: `<mud-table-story-paginated />` }),
};

/** The server sorts and pages: bind the total to length and let (pageIndex) re-run the request. */
export const ServerPaging: Story = {
  parameters: { controls: { disable: true }, docs: { source: { code: SERVER_PAGING_SOURCE, language: 'ts' } } },
  render: () => ({ template: `<mud-table-story-server-paging />` }),
};
