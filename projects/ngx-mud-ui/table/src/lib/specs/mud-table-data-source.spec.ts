import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSort } from '../mud-sort.directive';
import type { MudSortable } from '../mud-sort.directive';
import { MudTableDataSource } from '../mud-table-data-source';

interface Cerere {
  id: number;
  nume: string;
  suma: number | null;
  cod: string;
  detalii?: { prioritate: number };
}

const ROWS: Cerere[] = [
  { id: 1, nume: 'Maria Popescu', suma: 80, cod: '10', detalii: { prioritate: 2 } },
  { id: 2, nume: 'Ana Rusu', suma: null, cod: '9', detalii: { prioritate: 3 } },
  { id: 3, nume: 'Ion Ceban', suma: 1200, cod: '100', detalii: { prioritate: 1 } },
];

const names = (rows: Cerere[]): string[] => rows.map((row) => row.nume);

/** A real MudSort outside a template: inputs stay at their defaults, models are set directly. */
function createSort(): MudSort {
  return TestBed.runInInjectionContext(() => new MudSort());
}

function sortable(id: string): MudSortable {
  return { sortId: signal(id), start: signal(undefined), disableClear: signal(undefined) };
}

function latest<T>(source: MudTableDataSource<T>): T[] {
  let value: T[] = [];

  source.connect().subscribe((rows) => (value = rows)).unsubscribe();

  return value;
}

describe('MudTableDataSource', () => {
  it('emits the data unchanged when no sort is attached', () => {
    const source = new MudTableDataSource(ROWS);

    expect(latest(source)).toEqual(ROWS);
    expect(source.data).toBe(ROWS);
  });

  it('re-emits when data is replaced, coercing non-arrays to []', () => {
    const source = new MudTableDataSource(ROWS);

    source.data = [ROWS[2]];
    expect(names(latest(source))).toEqual(['Ion Ceban']);

    source.data = undefined as unknown as Cerere[];
    expect(latest(source)).toEqual([]);
  });

  it('waits for the sort to initialize before applying a pre-set state', () => {
    const source = new MudTableDataSource(ROWS);
    const sort = createSort();

    sort.active.set('nume');
    sort.direction.set('asc');
    source.sort = sort;
    // combineLatest holds until `initialized` fires, so the last render (the unsorted
    // rows pushed by the constructor) is still what subscribers see.
    expect(latest(source)).toEqual(ROWS);

    sort.ngOnInit();
    expect(names(latest(source))).toEqual(['Ana Rusu', 'Ion Ceban', 'Maria Popescu']);
  });

  describe('with an initialized sort', () => {
    let sort: MudSort;
    let source: MudTableDataSource<Cerere>;

    beforeEach(() => {
      sort = createSort();
      sort.ngOnInit();
      source = new MudTableDataSource(ROWS);
      source.sort = sort;
    });

    it('sorts strings both ways', () => {
      sort.sort(sortable('nume'));
      expect(names(latest(source))).toEqual(['Ana Rusu', 'Ion Ceban', 'Maria Popescu']);

      sort.sort(sortable('nume'));
      expect(names(latest(source))).toEqual(['Maria Popescu', 'Ion Ceban', 'Ana Rusu']);
    });

    it('sorts numbers, keeping empty values last in both directions', () => {
      sort.sort(sortable('suma'));
      expect(names(latest(source))).toEqual(['Maria Popescu', 'Ion Ceban', 'Ana Rusu']);

      sort.sort(sortable('suma'));
      expect(names(latest(source))).toEqual(['Ion Ceban', 'Maria Popescu', 'Ana Rusu']);
    });

    it('treats numeric strings as numbers', () => {
      sort.sort(sortable('cod'));
      expect(names(latest(source))).toEqual(['Ana Rusu', 'Maria Popescu', 'Ion Ceban']);
    });

    it('returns the original order once the sort is cleared', () => {
      const column = sortable('nume');

      sort.sort(column);
      sort.sort(column);
      sort.sort(column);
      expect(sort.direction()).toBe('');
      expect(latest(source)).toEqual(ROWS);
    });

    it('uses an overridden sortingDataAccessor for nested fields', () => {
      source.sortingDataAccessor = (row, id) => (id === 'prioritate' ? row.detalii?.prioritate ?? '' : '');
      sort.sort(sortable('prioritate'));

      expect(names(latest(source))).toEqual(['Ion Ceban', 'Maria Popescu', 'Ana Rusu']);
    });

    it('uses an overridden sortData wholesale', () => {
      source.sortData = (rows) => rows.slice().reverse();
      sort.sort(sortable('nume'));

      expect(names(latest(source))).toEqual(['Ion Ceban', 'Ana Rusu', 'Maria Popescu']);
    });

    it('does not mutate the consumer array', () => {
      const snapshot = [...ROWS];

      sort.sort(sortable('nume'));

      expect(ROWS).toEqual(snapshot);
    });

    it('stops updating after disconnect and resumes on connect', () => {
      const seen: string[][] = [];
      const subscription = source.connect().subscribe((rows) => seen.push(names(rows)));

      source.disconnect();
      source.data = [ROWS[1]];
      expect(seen.length).toBe(1);

      subscription.unsubscribe();
      expect(names(latest(source))).toEqual(['Ana Rusu']);
    });
  });
});
