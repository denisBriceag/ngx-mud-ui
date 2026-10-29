import { Component } from '@angular/core';
import { MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';
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

// The icon is registered once in app.config.ts: provideMudIcons([edit])
@Component({
  selector: 'app-table-row-actions',
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
    MudIconButton,
    MudIconComponent,
  ],
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
      <!-- small icon button (32px) + the actions-cell helper (4px block padding) keep the row at 40px -->
      <ng-container mudColumnDef="actiuni">
        <th
          mud-header-cell
          *mudHeaderCellDef
          class="mud-data-table__actions-cell"
          style="width: 96px"
        >
          Acțiuni
        </th>
        <td mud-cell *mudCellDef="let row" class="mud-data-table__actions-cell">
          <button
            type="button"
            mudIconButton
            size="sm"
            [attr.aria-label]="'Editează ' + row.nume"
            (click)="edit(row)"
          >
            <mud-icon name="edit" [scale]="16" />
          </button>
        </td>
      </ng-container>
      <tr mud-header-row *mudHeaderRowDef="columns"></tr>
      <tr mud-row *mudRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
export class TableRowActionsExample {
  readonly columns = ['nume', 'localitate', 'suma', 'actiuni'];
  readonly rows = CERERI;

  edit(row: Cerere): void {
    console.log('edit', row.id);
  }
}
