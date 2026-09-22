import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTable } from './mud-table.component';
import { MudCell, MudCellDef, MudColumnDef, MudHeaderCell, MudHeaderCellDef } from './mud-cell';
import { MudHeaderRow, MudHeaderRowDef, MudNoDataRow, MudRow, MudRowDef } from './mud-row';
import { MudSort } from './mud-sort.directive';
import { MudSortHeader } from './mud-sort-header.component';

interface Cerere {
  nume: string;
  suma: number;
}

const IMPORTS = [
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
];

@Component({
  imports: IMPORTS,
  template: `
    <table mud-table [dataSource]="rows()" mudSort active="suma" direction="desc" headerStyle="strong">
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
      <tr *mudNoDataRow>
        <td colspan="2">Nimic de afișat</td>
      </tr>
    </table>
  `,
})
class NativeHost {
  readonly columns = ['nume', 'suma'];
  readonly rows = signal<Cerere[]>([
    { nume: 'Ana Rusu', suma: 250 },
    { nume: 'Ion Ceban', suma: 1200 },
  ]);
}

@Component({
  imports: IMPORTS,
  template: `
    <mud-table [dataSource]="rows" mudSort>
      <ng-container mudColumnDef="nume">
        <mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</mud-header-cell>
        <mud-cell *mudCellDef="let row">{{ row.nume }}</mud-cell>
      </ng-container>
      <mud-header-row *mudHeaderRowDef="columns"></mud-header-row>
      <mud-row *mudRowDef="let row; columns: columns"></mud-row>
    </mud-table>
  `,
})
class FlexHost {
  readonly columns = ['nume'];
  readonly rows: Cerere[] = [{ nume: 'Ana Rusu', suma: 250 }];
}

describe('MudTable on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  it('serializes a native table with header, rows and the sorted state', async () => {
    const fixture = TestBed.createComponent(NativeHost);

    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;
    const headers = Array.from(root.querySelectorAll('th')) as HTMLElement[];

    expect(root.querySelectorAll('thead > tr.mud-data-table__header-row').length).toBe(1);
    expect(root.querySelectorAll('tbody > tr.mud-data-table__row').length).toBe(2);
    expect(headers[0].getAttribute('aria-sort')).toBe('none');
    expect(headers[1].getAttribute('aria-sort')).toBe('descending');
    expect(headers[1].querySelector('button.mud-sort-header__button')).not.toBeNull();
    expect(root.querySelector('table')?.classList.contains('mud-data-table--header-strong')).toBe(true);
  });

  it('serializes the empty state on the server', async () => {
    const fixture = TestBed.createComponent(NativeHost);

    fixture.componentInstance.rows.set([]);
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('tr.mud-data-table__no-data-row')?.textContent?.trim()).toBe('Nimic de afișat');
  });

  it('serializes the flex layout with ARIA roles', async () => {
    const fixture = TestBed.createComponent(FlexHost);

    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelector('mud-table')?.getAttribute('role')).toBe('table');
    expect(root.querySelectorAll('mud-row').length).toBe(1);
    expect(root.querySelector('mud-header-cell')?.getAttribute('aria-sort')).toBe('none');
  });
});
