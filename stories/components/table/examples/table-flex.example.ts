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
  selector: 'app-table-flex',
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
    <!-- same API on custom elements when a native <table> is not an option -->
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
})
export class TableFlexExample {
  readonly columns = ['nume', 'localitate', 'suma'];
  readonly rows = CERERI;
}
