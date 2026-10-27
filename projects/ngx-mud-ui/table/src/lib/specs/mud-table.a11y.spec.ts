import axe from 'axe-core';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTable } from '../mud-table.component';
import type { MudTableHeaderStyle } from '../mud-table.component';
import { MudCell, MudCellDef, MudColumnDef, MudFooterCell, MudFooterCellDef, MudHeaderCell, MudHeaderCellDef } from '../mud-cell';
import { MudFooterRow, MudFooterRowDef, MudHeaderRow, MudHeaderRowDef, MudNoDataRow, MudRow, MudRowDef } from '../mud-row';
import { MudSort } from '../mud-sort.directive';
import { MudSortHeader } from '../mud-sort-header.component';

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
  MudSort,
  MudSortHeader,
];

const IMPORTS = [...BASE_IMPORTS, MudFooterCellDef, MudFooterCell, MudFooterRowDef, MudFooterRow, MudNoDataRow];

@Component({
  imports: IMPORTS,
  template: `
    <div class="mud-data-table-container" tabindex="0">
      <table
        mud-table
        [dataSource]="rows()"
        [headerStyle]="headerStyle()"
        rowStyle="zebra"
        hoverable
        mudSort
        [active]="active()"
        [direction]="direction()"
        aria-label="Cereri depuse"
      >
        <ng-container mudColumnDef="nume">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
          <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
          <td mud-footer-cell *mudFooterCellDef>Total</td>
        </ng-container>
        <ng-container mudColumnDef="suma">
          <th mud-header-cell *mudHeaderCellDef mud-sort-header>Suma</th>
          <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
          <td mud-footer-cell *mudFooterCellDef>1530</td>
        </ng-container>
        <ng-container mudColumnDef="id">
          <th mud-header-cell *mudHeaderCellDef>Id</th>
          <td mud-cell *mudCellDef="let row">{{ row.id }}</td>
          <td mud-footer-cell *mudFooterCellDef></td>
        </ng-container>
        <tr mud-header-row *mudHeaderRowDef="columns"></tr>
        <tr mud-row *mudRowDef="let row; columns: columns" [selected]="row.id === 2"></tr>
        <tr mud-footer-row *mudFooterRowDef="columns"></tr>
        <tr *mudNoDataRow>
          <td [attr.colspan]="columns.length">Nimic de afișat</td>
        </tr>
      </table>
    </div>
  `,
})
class NativeHost {
  readonly columns = ['nume', 'suma', 'id'];
  readonly rows = signal<Cerere[]>(ROWS);
  readonly headerStyle = signal<MudTableHeaderStyle>('subtle');
  readonly active = signal('');
  readonly direction = signal<'asc' | 'desc' | ''>('');
}

@Component({
  imports: BASE_IMPORTS,
  template: `
    <mud-table [dataSource]="rows" mudSort aria-label="Cereri depuse">
      <ng-container mudColumnDef="nume">
        <mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</mud-header-cell>
        <mud-cell *mudCellDef="let row">{{ row.nume }}</mud-cell>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <mud-header-cell *mudHeaderCellDef>Suma</mud-header-cell>
        <mud-cell *mudCellDef="let row">{{ row.suma }}</mud-cell>
      </ng-container>
      <mud-header-row *mudHeaderRowDef="columns"></mud-header-row>
      <mud-row *mudRowDef="let row; columns: columns"></mud-row>
    </mud-table>
  `,
})
class FlexHost {
  readonly columns = ['nume', 'suma'];
  readonly rows = ROWS;
}

// axe's colour-contrast checks rasterise through HTMLCanvasElement#getContext,
// which jsdom lacks and which no CSS is loaded for anyway. Contrast is covered
// for real by table.contrast.spec.ts; exactly these two rules are turned off.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
  },
};

async function violations(element: HTMLElement): Promise<string[]> {
  const results = await axe.run(element, AXE_OPTIONS);

  return results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`);
}

describe('MudTable accessibility', () => {
  // axe skips detached subtrees silently, so every fixture is appended to the body.
  afterEach(() => {
    document.body.replaceChildren();
  });

  it.each(['subtle', 'strong', 'white'] as const)('has no axe violations with the %s header, unsorted', async (headerStyle) => {
    const fixture = TestBed.createComponent(NativeHost);

    fixture.componentInstance.headerStyle.set(headerStyle);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    expect(await violations(fixture.nativeElement as HTMLElement)).toEqual([]);
  });

  it('has no axe violations with a sorted column', async () => {
    const fixture = TestBed.createComponent(NativeHost);

    fixture.componentInstance.active.set('suma');
    fixture.componentInstance.direction.set('desc');
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const root: HTMLElement = fixture.nativeElement;

    expect(root.querySelectorAll('th')[1].getAttribute('aria-sort')).toBe('descending');
    expect(await violations(root)).toEqual([]);
  });

  it('has no axe violations in the empty state', async () => {
    const fixture = TestBed.createComponent(NativeHost);

    fixture.componentInstance.rows.set([]);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    expect(await violations(fixture.nativeElement as HTMLElement)).toEqual([]);
  });

  it('has no axe violations in the flex layout', async () => {
    const fixture = TestBed.createComponent(FlexHost);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    expect(await violations(fixture.nativeElement as HTMLElement)).toEqual([]);
  });

  // A rule that never RAN also reports no violations, so the rules this design
  // leans on are pinned as having actually passed.
  it('actually exercises the table and aria-sort rules', async () => {
    const fixture = TestBed.createComponent(NativeHost);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const results = await axe.run(fixture.nativeElement as HTMLElement, AXE_OPTIONS);
    const passed = results.passes.map((pass) => pass.id);

    expect(passed).toContain('aria-valid-attr-value');
    expect(passed).toContain('aria-allowed-attr');
    expect(passed).toContain('th-has-data-cells');
    expect(passed).toContain('button-name');
  });
});
