import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudTable } from './mud-table.component';
import type { MudTableHeaderStyle, MudTableRowStyle } from './mud-table.component';
import {
  MudCell,
  MudCellDef,
  MudColumnDef,
  MudFooterCell,
  MudFooterCellDef,
  MudHeaderCell,
  MudHeaderCellDef,
} from './mud-cell';
import {
  MudFooterRow,
  MudFooterRowDef,
  MudHeaderRow,
  MudHeaderRowDef,
  MudNoDataRow,
  MudRow,
  MudRowDef,
} from './mud-row';

interface Cerere {
  id: number;
  nume: string;
  suma: number;
}

const ROWS: Cerere[] = [
  { id: 1, nume: 'Ana Rusu', suma: 250 },
  { id: 2, nume: 'Ion Ceban', suma: 1200 },
  { id: 3, nume: 'Maria Popescu', suma: 80 },
];

const BASE_IMPORTS = [
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
];

const TABLE_IMPORTS = [...BASE_IMPORTS, MudFooterCellDef, MudFooterCell, MudFooterRowDef, MudFooterRow, MudNoDataRow];

@Component({
  imports: TABLE_IMPORTS,
  template: `
    <table
      mud-table
      [dataSource]="rows()"
      [headerStyle]="headerStyle()"
      [rowStyle]="rowStyle()"
      [hoverable]="hoverable()"
    >
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef>Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
        <td mud-footer-cell *mudFooterCellDef>Total</td>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <th mud-header-cell *mudHeaderCellDef>Suma</th>
        <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
        <td mud-footer-cell *mudFooterCellDef>{{ total() }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns; sticky: sticky()"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns" [selected]="row.id === selectedId()"></tr>
      <tr mud-footer-row *mudFooterRowDef="columns"></tr>
      <tr *mudNoDataRow>
        <td [attr.colspan]="columns.length">Nimic de afișat</td>
      </tr>
    </table>
  `,
})
class NativeHost {
  readonly columns = ['nume', 'suma'];
  readonly rows = signal<Cerere[]>(ROWS);
  readonly headerStyle = signal<MudTableHeaderStyle>('subtle');
  readonly rowStyle = signal<MudTableRowStyle>('default');
  readonly hoverable = signal(false);
  readonly sticky = signal(false);
  readonly selectedId = signal<number | null>(null);
  readonly total = computed(() => this.rows().reduce((sum, row) => sum + row.suma, 0));
}

@Component({
  imports: BASE_IMPORTS,
  template: `
    <mud-table [dataSource]="rows">
      <ng-container mudColumnDef="nume">
        <mud-header-cell *mudHeaderCellDef>Nume</mud-header-cell>
        <mud-cell *mudCellDef="let row">{{ row.nume }}</mud-cell>
      </ng-container>
      <mud-header-row *mudHeaderRowDef="columns"></mud-header-row>
      <mud-row *mudRowDef="let row; columns: columns"></mud-row>
    </mud-table>
  `,
})
class FlexHost {
  readonly columns = ['nume'];
  readonly rows = ROWS;
}

@Component({
  imports: BASE_IMPORTS,
  template: `
    <table mud-table recycleRows [dataSource]="rows">
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef>Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
class RecycleHost {
  readonly columns = ['nume'];
  readonly rows = ROWS;
}

async function renderNative() {
  const fixture = TestBed.createComponent(NativeHost);

  await fixture.whenStable();

  const root: HTMLElement = fixture.nativeElement;
  const table = root.querySelector('table') as HTMLTableElement;

  return { fixture, host: fixture.componentInstance, root, table };
}

describe('MudTable (native <table>)', () => {
  it('renders header, body and footer rows inside thead/tbody/tfoot', async () => {
    const { table } = await renderNative();

    expect(table.querySelectorAll('thead > tr.mud-data-table__header-row').length).toBe(1);
    expect(table.querySelectorAll('tbody > tr.mud-data-table__row').length).toBe(3);
    expect(table.querySelectorAll('tfoot > tr.mud-data-table__footer-row').length).toBe(1);
    expect(table.querySelector('tbody > tr.mud-data-table__row > td.mud-data-table__cell')?.textContent?.trim()).toBe(
      'Ana Rusu',
    );
    expect(table.querySelector('tfoot td.mud-data-table__footer-cell:last-child')?.textContent?.trim()).toBe('1530');
  });

  it('adds mud-column-<name> beside the CDK column class on every cell', async () => {
    const { table } = await renderNative();
    const header = table.querySelector('th.mud-data-table__header-cell') as HTMLElement;
    const cell = table.querySelector('td.mud-data-table__cell') as HTMLElement;

    expect(header.classList.contains('cdk-column-nume')).toBe(true);
    expect(header.classList.contains('mud-column-nume')).toBe(true);
    expect(cell.classList.contains('mud-column-nume')).toBe(true);
  });

  it('keeps the table role and columnheader roles', async () => {
    const { table } = await renderNative();

    expect(table.getAttribute('role')).toBe('table');
    expect(table.querySelector('th')?.getAttribute('role')).toBe('columnheader');
  });

  it('reflects headerStyle, rowStyle and hoverable as host classes', async () => {
    const { fixture, host, table } = await renderNative();

    expect(table.classList.contains('mud-data-table')).toBe(true);
    expect(table.classList.contains('mud-data-table--header-subtle')).toBe(true);
    expect(table.classList.contains('mud-data-table--rows-zebra')).toBe(false);
    expect(table.classList.contains('mud-data-table--hoverable')).toBe(false);

    host.headerStyle.set('strong');
    host.rowStyle.set('zebra');
    host.hoverable.set(true);
    await fixture.whenStable();

    expect(table.classList.contains('mud-data-table--header-subtle')).toBe(false);
    expect(table.classList.contains('mud-data-table--header-strong')).toBe(true);
    expect(table.classList.contains('mud-data-table--rows-zebra')).toBe(true);
    expect(table.classList.contains('mud-data-table--hoverable')).toBe(true);

    host.headerStyle.set('white');
    await fixture.whenStable();

    expect(table.classList.contains('mud-data-table--header-white')).toBe(true);
  });

  it('shows the no-data row only while the data source is empty', async () => {
    const { fixture, host, table } = await renderNative();

    expect(table.querySelector('.mud-data-table__no-data-row')).toBeNull();

    host.rows.set([]);
    await fixture.whenStable();

    const noData = table.querySelector('tbody > tr.mud-data-table__no-data-row') as HTMLElement;
    const cell = noData.querySelector('td') as HTMLElement;

    expect(noData.textContent?.trim()).toBe('Nimic de afișat');
    // The <td> gets the cell classes from the directive, not from the consumer.
    expect(cell.classList.contains('mud-data-table__cell')).toBe(true);
    expect(cell.classList.contains('mud-data-table__no-data-cell')).toBe(true);
    // Deliberately NOT a .mud-data-table__row: zebra and hover must never style it.
    expect(noData.classList.contains('mud-data-table__row')).toBe(false);

    host.rows.set(ROWS);
    await fixture.whenStable();

    expect(table.querySelector('.mud-data-table__no-data-row')).toBeNull();
    expect(table.querySelectorAll('tbody > tr.mud-data-table__row').length).toBe(3);
  });

  it('marks a selected row with the modifier class and aria-selected', async () => {
    const { fixture, host, table } = await renderNative();
    const rows = () => Array.from(table.querySelectorAll('tbody > tr.mud-data-table__row')) as HTMLElement[];

    expect(rows().some((row) => row.classList.contains('mud-data-table__row--selected'))).toBe(false);
    expect(rows()[1].hasAttribute('aria-selected')).toBe(false);

    host.selectedId.set(2);
    await fixture.whenStable();

    expect(rows()[1].classList.contains('mud-data-table__row--selected')).toBe(true);
    expect(rows()[1].getAttribute('aria-selected')).toBe('true');
    expect(rows()[0].classList.contains('mud-data-table__row--selected')).toBe(false);

    host.selectedId.set(null);
    await fixture.whenStable();

    expect(rows()[1].classList.contains('mud-data-table__row--selected')).toBe(false);
    expect(rows()[1].hasAttribute('aria-selected')).toBe(false);
  });

  it('marks header cells sticky through the CDK sticky styler', async () => {
    const { fixture, host, table } = await renderNative();

    host.sticky.set(true);
    await fixture.whenStable();

    const header = table.querySelector('th.mud-data-table__header-cell') as HTMLElement;

    expect(header.classList.contains('cdk-table-sticky')).toBe(true);
    expect(header.style.position).toBe('sticky');
  });
});

describe('MudTable (flex <mud-table>)', () => {
  it('renders rows and cells with ARIA table roles and no thead/tbody', async () => {
    const fixture = TestBed.createComponent(FlexHost);

    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const table = root.querySelector('mud-table') as HTMLElement;

    expect(table.getAttribute('role')).toBe('table');
    expect(table.querySelector('thead')).toBeNull();
    expect(table.querySelector('mud-header-row.mud-data-table__header-row')?.getAttribute('role')).toBe('row');
    expect(table.querySelectorAll('mud-row.mud-data-table__row').length).toBe(3);
    expect(table.querySelector('mud-header-cell.mud-data-table__header-cell')?.getAttribute('role')).toBe(
      'columnheader',
    );
    expect(table.querySelector('mud-cell.mud-data-table__cell')?.getAttribute('role')).toBe('cell');
  });
});

describe('MudTable recycleRows', () => {
  it('accepts the CDK recycleRows attribute', async () => {
    const fixture = TestBed.createComponent(RecycleHost);

    await fixture.whenStable();

    const table = fixture.debugElement.query(By.directive(MudTable)).componentInstance as MudTable<Cerere>;

    expect(table.recycleRows).toBe(true);
  });
});
