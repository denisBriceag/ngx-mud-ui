import { DataSource } from '@angular/cdk/collections';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import type { Observable, Subscription } from 'rxjs';
import type { MudPagination } from 'ngx-mud-ui/pagination';
import type { MudSort } from './mud-sort.directive';

/**
 * ```ts
 * readonly source = new MudTableDataSource(rows);
 * readonly sort = viewChild.required(MudSort);
 * readonly paginator = viewChild.required(MudPagination);
 *
 * constructor() {
 *   afterNextRender(() => {
 *     this.source.sort = this.sort();
 *     this.source.paginator = this.paginator();
 *   });
 * }
 * ```
 */
export class MudTableDataSource<T> extends DataSource<T> {
  private readonly _data: BehaviorSubject<T[]>;
  private readonly _renderData = new BehaviorSubject<T[]>([]);
  private _renderChangesSubscription: Subscription | null = null;
  private _sort: MudSort | null = null;
  private _paginator: MudPagination | null = null;

  sortingDataAccessor: (data: T, sortHeaderId: string) => string | number = (data, sortHeaderId) => {
    const value = (data as Record<string, unknown>)[sortHeaderId];

    if (isNumberValue(value)) {
      const numberValue = Number(value);

      return numberValue < Number.MAX_SAFE_INTEGER ? numberValue : String(value);
    }

    return value as string | number;
  };

  sortData: (data: T[], sort: MudSort) => T[] = (data, sort) => {
    const active = sort.active();
    const direction = sort.direction();

    if (!active || direction === '') {
      return data;
    }

    const factor = direction === 'asc' ? 1 : -1;

    return data.slice().sort((a, b) => {
      let valueA = this.sortingDataAccessor(a, active);
      let valueB = this.sortingDataAccessor(b, active);

      const emptyA = valueA == null || valueA === '';
      const emptyB = valueB == null || valueB === '';

      if (emptyA || emptyB) {
        return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
      }

      // Mixed types compare as strings so 9 and '10' stay deterministic.
      if (typeof valueA !== typeof valueB) {
        valueA = String(valueA);
        valueB = String(valueB);
      }

      if (valueA === valueB) {
        return 0;
      }

      return (valueA > valueB ? 1 : -1) * factor;
    });
  };

  constructor(initialData: T[] = []) {
    super();
    this._data = new BehaviorSubject<T[]>(initialData);
    this._updateChangeSubscription();
  }

  /** Rows to display; assigning re-emits. */
  get data(): T[] {
    return this._data.value;
  }

  set data(data: T[]) {
    this._data.next(Array.isArray(data) ? data : []);
  }

  get sort(): MudSort | null {
    return this._sort;
  }

  set sort(sort: MudSort | null) {
    this._sort = sort;
    this._updateChangeSubscription();
  }

  get paginator(): MudPagination | null {
    return this._paginator;
  }

  set paginator(paginator: MudPagination | null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }

  /** Stream of rows to render; re-subscribes after a disconnect. */
  connect(): BehaviorSubject<T[]> {
    if (!this._renderChangesSubscription) {
      this._updateChangeSubscription();
    }

    return this._renderData;
  }

  /** Stops reacting to data and sort changes until connect() is called again. */
  disconnect(): void {
    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = null;
  }

  private _updateChangeSubscription(): void {
    const sort = this._sort;
    const paginator = this._paginator;
    const sortChange: Observable<unknown> = sort ? merge(outputToObservable(sort.sortChange), sort.initialized) : of(null);
    const pageChange: Observable<unknown> = paginator ? merge(paginator._stateChanges, paginator.initialized) : of(null);

    const sorted = combineLatest([this._data, sortChange]).pipe(map(([data]) => (sort ? this.sortData(data, sort) : data)));

    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = combineLatest([sorted, pageChange])
      .pipe(
        tap(([data]) => this._updatePaginator(data.length)),
        map(([data]) => this._pageData(data)),
      )
      .subscribe((data) => this._renderData.next(data));
  }

  private _pageData(data: T[]): T[] {
    const paginator = this._paginator;

    if (!paginator) return data;

    const size = paginator._pageSize();
    const last = Math.max(Math.ceil(data.length / size) - 1, 0);
    const requested = Math.floor(paginator.pageIndex());
    const index = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), last) : 0;

    return data.slice(index * size, index * size + size);
  }

  private _updatePaginator(length: number): void {
    void Promise.resolve().then(() => {
      const paginator = this._paginator;

      if (!paginator) return;

      paginator.length.set(length);

      const lastIndex = Math.max(Math.ceil(length / paginator._pageSize()) - 1, 0);
      const previous = paginator.pageIndex();

      if (previous > lastIndex) {
        paginator.pageIndex.set(lastIndex);
        paginator._emitPageEvent(previous);
      }
    });
  }
}

function isNumberValue(value: unknown): boolean {
  return !Number.isNaN(Number.parseFloat(value as string)) && !Number.isNaN(Number(value));
}
