import { TestBed } from '@angular/core/testing';
import { MudPagination } from 'ngx-mud-ui/pagination';
import type { MudPageEvent } from 'ngx-mud-ui/pagination';
import { MudSort } from '../mud-sort.directive';
import { MudTableDataSource } from '../mud-table-data-source';

interface Row {
  id: number;
}

const rows = (n: number): Row[] => Array.from({ length: n }, (_v, i) => ({ id: i + 1 }));
const ids = (list: Row[]) => list.map((r) => r.id);

function latest<T>(source: MudTableDataSource<T>): T[] {
  let value: T[] = [];

  source.connect().subscribe((r) => (value = r)).unsubscribe();

  return value;
}

async function createPaginator(pageSize = 2) {
  const fixture = TestBed.createComponent(MudPagination);
  const events: MudPageEvent[] = [];

  fixture.componentRef.setInput('pageSize', pageSize);
  fixture.componentInstance.page.subscribe((e) => events.push(e));
  await fixture.whenStable();

  // Microtask first (the data source writes length in one), then let effects flush.
  const settle = async () => {
    await Promise.resolve();
    await fixture.whenStable();
    await Promise.resolve();
  };

  return { fixture, paginator: fixture.componentInstance, events, settle };
}

describe('MudTableDataSource with a paginator', () => {
  it('slices the first page and writes length', async () => {
    const source = new MudTableDataSource(rows(5));
    const { paginator, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();

    expect(ids(latest(source))).toEqual([1, 2]);
    expect(paginator.length()).toBe(5);
    expect(paginator.getNumberOfPages()).toBe(3);
  });

  it('follows page clicks and methods', async () => {
    const source = new MudTableDataSource(rows(5));
    const { paginator, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();

    paginator.nextPage();
    await settle();
    expect(ids(latest(source))).toEqual([3, 4]);

    paginator.lastPage();
    await settle();
    expect(ids(latest(source))).toEqual([5]);
  });

  it('follows a parent pageIndex binding that emits no page event', async () => {
    const source = new MudTableDataSource(rows(6));
    const { fixture, paginator, events, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();

    fixture.componentRef.setInput('pageIndex', 2);
    await settle();

    expect(ids(latest(source))).toEqual([5, 6]);
    expect(events).toEqual([]);
  });

  it('clamps and emits when the data shrinks under the current page', async () => {
    const source = new MudTableDataSource(rows(6));
    const { paginator, events, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();
    paginator.lastPage();
    await settle();
    events.length = 0;

    source.data = rows(3);
    await settle();

    expect(paginator.pageIndex()).toBe(1);
    expect(ids(latest(source))).toEqual([3]);
    expect(events).toEqual([{ pageIndex: 1, previousPageIndex: 2, pageSize: 2, length: 3 }]);
  });

  // Review Focus 4
  it('clamps when pageSize grows', async () => {
    const source = new MudTableDataSource(rows(10));
    const { fixture, paginator, events, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();
    paginator.lastPage(); // index 4
    await settle();
    events.length = 0;

    fixture.componentRef.setInput('pageSize', 5); // 2 pages now
    await settle();

    expect(paginator.pageIndex()).toBe(1);
    expect(ids(latest(source))).toEqual([6, 7, 8, 9, 10]);
    expect(events.at(-1)).toEqual({ pageIndex: 1, previousPageIndex: 4, pageSize: 5, length: 10 });
  });

  it('does not emit for empty data on the first page', async () => {
    const source = new MudTableDataSource<Row>([]);
    const { paginator, events, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();

    expect(latest(source)).toEqual([]);
    expect(paginator.length()).toBe(0);
    expect(events).toEqual([]);
  });

  it('pages the sorted rows, and re-sorting keeps the page', async () => {
    const source = new MudTableDataSource(rows(5));
    const sort = TestBed.runInInjectionContext(() => new MudSort());
    const { paginator, settle } = await createPaginator(2);

    sort.ngOnInit();
    source.sort = sort;
    source.paginator = paginator;
    await settle();

    sort.active.set('id');
    sort.direction.set('desc');
    sort.sortChange.emit({ active: 'id', direction: 'desc' });
    await settle();
    expect(ids(latest(source))).toEqual([5, 4]);

    paginator.nextPage();
    await settle();
    expect(ids(latest(source))).toEqual([3, 2]);
  });

  it('returns every row again when the paginator is removed', async () => {
    const source = new MudTableDataSource(rows(5));
    const { paginator, settle } = await createPaginator(2);

    source.paginator = paginator;
    await settle();
    source.paginator = null;

    expect(ids(latest(source))).toEqual([1, 2, 3, 4, 5]);
  });
});
