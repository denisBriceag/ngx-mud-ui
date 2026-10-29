import { Component, signal } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
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
} from 'ngx-mud-ui/table';

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

@Component({
  selector: 'app-table-selection',
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
    MudCheckbox,
  ],
  template: `
    <!-- a selection column is an ordinary column: a mud-checkbox per row + a CDK SelectionModel -->
    <table mud-table [dataSource]="rows" rowStyle="zebra" hoverable aria-label="Cereri de aprobat">
      <ng-container mudColumnDef="select">
        <th mud-header-cell *mudHeaderCellDef class="mud-data-table__selection-cell">
          <mud-checkbox
            size="sm"
            [checked]="allSelected()"
            [indeterminate]="someSelected()"
            (checkedChange)="toggleAll()"
            aria-label="Selectează toate rândurile"
          />
        </th>
        <td mud-cell *mudCellDef="let row" class="mud-data-table__selection-cell">
          <mud-checkbox
            size="sm"
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
      <tr
        mud-row
        *mudRowDef="let row; columns: columns"
        [selected]="selection.isSelected(row)"
      ></tr>
    </table>
  `,
})
export class TableSelectionExample {
  readonly columns = ['select', 'nume', 'stare'];
  readonly rows = CERERI;
  readonly selection = new SelectionModel<Cerere>(true, []);
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

    this.allSelected.set(selected === this.rows.length);
    this.someSelected.set(selected > 0 && selected < this.rows.length);
  }
}
