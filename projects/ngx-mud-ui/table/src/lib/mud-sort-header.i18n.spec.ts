import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudTable } from './mud-table.component';
import { MudCell, MudCellDef, MudColumnDef, MudHeaderCell, MudHeaderCellDef } from './mud-cell';
import { MudHeaderRow, MudHeaderRowDef, MudRow, MudRowDef } from './mud-row';
import { MudSort } from './mud-sort.directive';
import { MudSortHeader } from './mud-sort-header.component';

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
class Host {
  readonly rows = [{ nume: 'Ana' }];
  readonly description = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  return {
    fixture,
    text: () => (fixture.nativeElement as HTMLElement).querySelector('.mud-sort-header__description')!.textContent!.trim(),
  };
}

describe('MudSortHeader i18n', () => {
  it('uses the English default with no provider', async () => {
    expect((await render()).text()).toBe('Sort');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });

    expect((await render()).text()).toBe(MUD_LABELS_RO.table!.sort);
  });

  it('an instance input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, text } = await render();

    fixture.componentInstance.description.set('Mine');
    await fixture.whenStable();
    expect(text()).toBe('Mine');
  });

  it('blank sortActionDescription falls back', async () => {
    const { fixture, text } = await render();

    fixture.componentInstance.description.set('  ');
    await fixture.whenStable();
    expect(text()).toBe('Sort');
  });
});
