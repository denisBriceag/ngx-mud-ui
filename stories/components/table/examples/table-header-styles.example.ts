import { Component } from '@angular/core';
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
import type { MudTableHeaderStyle } from 'ngx-mud-ui/table';

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
  selector: 'app-table-header-styles',
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
  ],
  template: `
    @for (style of headerStyles; track style) {
      <table
        mud-table
        [dataSource]="rows"
        [headerStyle]="style"
        [attr.aria-label]="'Cereri depuse, ' + style"
      >
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
      </table>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 24px;
    }
  `,
})
export class TableHeaderStylesExample {
  readonly columns = ['nume', 'localitate', 'depusa', 'suma'];
  readonly rows = CERERI;
  readonly headerStyles: MudTableHeaderStyle[] = ['subtle', 'strong', 'white'];
}
