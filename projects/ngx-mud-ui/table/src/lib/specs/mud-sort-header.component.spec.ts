import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudTable } from '../mud-table.component';
import { MudCell, MudCellDef, MudColumnDef, MudHeaderCell, MudHeaderCellDef } from '../mud-cell';
import { MudHeaderRow, MudHeaderRowDef, MudRow, MudRowDef } from '../mud-row';
import { MudSort } from '../mud-sort.directive';
import type { MudSortDirection, MudSortState } from '../mud-sort.directive';
import { MudSortHeader } from '../mud-sort-header.component';

interface Cerere {
  id: number;
  nume: string;
  suma: number;
}

const ROWS: Cerere[] = [
  { id: 1, nume: 'Ana Rusu', suma: 250 },
  { id: 2, nume: 'Ion Ceban', suma: 1200 },
];

@Component({
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
      [dataSource]="rows"
      mudSort
      [active]="active()"
      [direction]="direction()"
      [disabled]="sortDisabled()"
      (sortChange)="changes.push($event)"
    >
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header [disabled]="numeDisabled()" sortActionDescription="Sortează">
          Nume
        </th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <ng-container mudColumnDef="suma">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header="valoare" start="desc" disableClear>Suma</th>
        <td mud-cell *mudCellDef="let row">{{ row.suma }}</td>
      </ng-container>
      <ng-container mudColumnDef="id">
        <th mud-header-cell *mudHeaderCellDef>Id</th>
        <td mud-cell *mudCellDef="let row">{{ row.id }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
class Host {
  readonly columns = ['nume', 'suma', 'id'];
  readonly rows = ROWS;
  readonly active = signal('');
  readonly direction = signal<MudSortDirection>('');
  readonly sortDisabled = signal(false);
  readonly numeDisabled = signal(false);
  readonly changes: MudSortState[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const root: HTMLElement = fixture.nativeElement;
  const headers = Array.from(root.querySelectorAll('th')) as HTMLTableCellElement[];
  const sort = fixture.debugElement.query(By.directive(MudSort)).injector.get(MudSort);

  return { fixture, host: fixture.componentInstance, root, nume: headers[0], suma: headers[1], id: headers[2], sort };
}

function button(th: HTMLElement): HTMLButtonElement | null {
  return th.querySelector('button.mud-sort-header__button');
}

function iconPath(th: HTMLElement): string {
  return th.querySelector('svg.mud-sort-header__icon path')?.getAttribute('d') ?? '';
}

describe('MudSortHeader', () => {
  it('registers with the column name by default and with the explicit id otherwise', async () => {
    const { sort } = await render();

    expect(Array.from(sort.sortables.keys())).toEqual(['nume', 'valoare']);
  });

  it('renders a native button named by the projected label, described by the action text', async () => {
    const { nume } = await render();
    const control = button(nume) as HTMLButtonElement;
    const description = nume.querySelector('.mud-sort-header__description') as HTMLElement;

    expect(control.type).toBe('button');
    expect(control.textContent?.trim()).toBe('Nume');
    expect(description.textContent?.trim()).toBe('Sortează');
    expect(control.getAttribute('aria-describedby')).toBe(description.id);
    expect(description.id).toMatch(/^mud-sort-header-description-\d+$/);
  });

  it('exposes aria-sort="none" until the column is sorted, and never on a plain header', async () => {
    const { nume, suma, id } = await render();

    expect(nume.getAttribute('aria-sort')).toBe('none');
    expect(suma.getAttribute('aria-sort')).toBe('none');
    expect(id.hasAttribute('aria-sort')).toBe(false);
  });

  it('cycles ascending → descending → none on click, swapping the chevron', async () => {
    const { fixture, host, nume } = await render();
    const grabber = iconPath(nume);

    expect(grabber.startsWith('M10.136 9.47')).toBe(true);

    button(nume)?.click();
    await fixture.whenStable();
    expect(nume.getAttribute('aria-sort')).toBe('ascending');
    expect(nume.classList.contains('mud-sort-header--sorted')).toBe(true);
    expect(iconPath(nume).startsWith('M3.217 13.35')).toBe(true);

    button(nume)?.click();
    await fixture.whenStable();
    expect(nume.getAttribute('aria-sort')).toBe('descending');
    expect(iconPath(nume).startsWith('M3.217 6.65')).toBe(true);

    button(nume)?.click();
    await fixture.whenStable();
    expect(nume.getAttribute('aria-sort')).toBe('none');
    expect(nume.classList.contains('mud-sort-header--sorted')).toBe(false);
    expect(iconPath(nume)).toBe(grabber);

    expect(host.changes).toEqual([
      { active: 'nume', direction: 'asc' },
      { active: 'nume', direction: 'desc' },
      { active: 'nume', direction: '' },
    ]);
  });

  it('applies the header-level start and disableClear', async () => {
    const { fixture, suma } = await render();

    button(suma)?.click();
    await fixture.whenStable();
    expect(suma.getAttribute('aria-sort')).toBe('descending');

    button(suma)?.click();
    await fixture.whenStable();
    expect(suma.getAttribute('aria-sort')).toBe('ascending');

    button(suma)?.click();
    await fixture.whenStable();
    expect(suma.getAttribute('aria-sort')).toBe('descending');
  });

  it('moves the sorted state to the newly clicked column', async () => {
    const { fixture, nume, suma } = await render();

    button(nume)?.click();
    await fixture.whenStable();
    button(suma)?.click();
    await fixture.whenStable();

    expect(nume.getAttribute('aria-sort')).toBe('none');
    expect(suma.getAttribute('aria-sort')).toBe('descending');
  });

  it('reflects an externally bound sort state', async () => {
    const { fixture, host, suma } = await render();

    host.active.set('valoare');
    host.direction.set('asc');
    await fixture.whenStable();

    expect(suma.getAttribute('aria-sort')).toBe('ascending');
    expect(iconPath(suma).startsWith('M3.217 13.35')).toBe(true);
  });

  it('renders a disabled button with no aria-sort while disabled, and recovers', async () => {
    const { fixture, host, nume } = await render();

    host.numeDisabled.set(true);
    await fixture.whenStable();

    expect(button(nume)?.disabled).toBe(true);
    expect(nume.hasAttribute('aria-sort')).toBe(false);
    expect(nume.classList.contains('mud-sort-header--disabled')).toBe(true);
    expect(button(nume)?.getAttribute('aria-describedby')).toBeNull();
    // The projected label must survive the branch swap.
    expect(nume.textContent?.trim()).toBe('Nume');

    host.numeDisabled.set(false);
    await fixture.whenStable();

    expect(button(nume)?.disabled).toBe(false);
    expect(button(nume)?.textContent?.trim()).toBe('Nume');
    expect(nume.getAttribute('aria-sort')).toBe('none');
    expect(button(nume)?.getAttribute('aria-describedby')).not.toBeNull();
  });

  it('disables every header when the container is disabled', async () => {
    const { fixture, host, nume, suma } = await render();

    host.sortDisabled.set(true);
    await fixture.whenStable();

    expect(button(nume)?.disabled).toBe(true);
    expect(button(suma)?.disabled).toBe(true);
    expect(suma.hasAttribute('aria-sort')).toBe(false);
  });

  it('deregisters when destroyed', async () => {
    const { fixture, sort } = await render();

    fixture.destroy();

    expect(sort.sortables.size).toBe(0);
  });

  it('throws when constructed outside a mudSort container', () => {
    expect(() => TestBed.runInInjectionContext(() => new MudSortHeader())).toThrowError(/mudSort/);
  });
});

@Component({
  imports: [MudTable, MudColumnDef, MudHeaderCellDef, MudCellDef, MudHeaderCell, MudCell, MudHeaderRowDef, MudRowDef, MudHeaderRow, MudRow, MudSort, MudSortHeader],
  template: `
    <table mud-table [dataSource]="rows" mudSort>
      <ng-container mudColumnDef="nume">
        <th mud-header-cell *mudHeaderCellDef mud-sort-header [sortActionDescription]="description()">Nume</th>
        <td mud-cell *mudCellDef="let row">{{ row.nume }}</td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="['nume']"></tr>
      <tr mud-row *mudRowDef="let row; columns: ['nume']"></tr>
    </table>
  `,
})
class I18nHost {
  readonly rows = [{ nume: 'Ana' }];
  readonly description = signal<string | undefined>(undefined);
}

async function renderI18n() {
  const fixture = TestBed.createComponent(I18nHost);

  await fixture.whenStable();

  return {
    fixture,
    text: () => (fixture.nativeElement as HTMLElement).querySelector('.mud-sort-header__description')!.textContent!.trim(),
  };
}

describe('MudSortHeader i18n', () => {
  it('uses the English default with no provider', async () => {
    expect((await renderI18n()).text()).toBe('Sort');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });

    expect((await renderI18n()).text()).toBe(MUD_LABELS_RO.table!.sort);
  });

  it('an instance input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, text } = await renderI18n();

    fixture.componentInstance.description.set('Mine');
    await fixture.whenStable();
    expect(text()).toBe('Mine');
  });

  it('blank sortActionDescription falls back', async () => {
    const { fixture, text } = await renderI18n();

    fixture.componentInstance.description.set('  ');
    await fixture.whenStable();
    expect(text()).toBe('Sort');
  });
});
