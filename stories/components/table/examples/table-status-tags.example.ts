import { Component } from '@angular/core';
import { MudTag } from 'ngx-mud-ui/tag';
import type { MudTagColor } from 'ngx-mud-ui/tag';
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
  selector: 'app-table-status-tags',
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
    MudTag,
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
    </table>
  `,
})
export class TableStatusTagsExample {
  readonly columns = ['nume', 'localitate', 'depusa', 'stare'];
  readonly rows = CERERI;
  readonly stateColor: Record<string, MudTagColor> = {
    Aprobată: 'success',
    Respinsă: 'danger',
    'În examinare': 'info',
  };
}
