import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudSort } from './mud-sort.directive';
import type { MudSortDirection, MudSortState, MudSortable } from './mud-sort.directive';

@Component({
  imports: [MudSort],
  template: `
    <div
      mudSort
      [active]="active()"
      [direction]="direction()"
      [start]="start()"
      [disableClear]="disableClear()"
      [disabled]="disabled()"
      (activeChange)="active.set($event)"
      (directionChange)="direction.set($event)"
      (sortChange)="changes.push($event)"
    ></div>
  `,
})
class Host {
  readonly active = signal('');
  readonly direction = signal<MudSortDirection>('');
  readonly start = signal<'asc' | 'desc'>('asc');
  readonly disableClear = signal(false);
  readonly disabled = signal(false);
  readonly changes: MudSortState[] = [];
}

function sortable(id: string, start?: 'asc' | 'desc', disableClear?: boolean): MudSortable {
  return { sortId: signal(id), start: signal(start), disableClear: signal(disableClear) };
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const sort = fixture.debugElement.query(By.directive(MudSort)).injector.get(MudSort);

  return { fixture, host: fixture.componentInstance, sort };
}

describe('MudSort', () => {
  it('cycles none → asc → desc → none for a column that starts ascending', async () => {
    const { sort, host } = await render();
    const nume = sortable('nume');

    sort.register(nume);
    sort.sort(nume);
    expect(sort.active()).toBe('nume');
    expect(sort.direction()).toBe('asc');

    sort.sort(nume);
    expect(sort.direction()).toBe('desc');

    sort.sort(nume);
    expect(sort.direction()).toBe('');
    expect(sort.active()).toBe('nume');

    expect(host.changes).toEqual([
      { active: 'nume', direction: 'asc' },
      { active: 'nume', direction: 'desc' },
      { active: 'nume', direction: '' },
    ]);
  });

  it('honours the container start direction', async () => {
    const { sort, host, fixture } = await render();
    const nume = sortable('nume');

    host.start.set('desc');
    await fixture.whenStable();
    sort.register(nume);

    sort.sort(nume);
    expect(sort.direction()).toBe('desc');
    sort.sort(nume);
    expect(sort.direction()).toBe('asc');
    sort.sort(nume);
    expect(sort.direction()).toBe('');
  });

  it('lets a sortable override start and disableClear', async () => {
    const { sort } = await render();
    const suma = sortable('suma', 'desc', true);

    sort.register(suma);
    sort.sort(suma);
    expect(sort.direction()).toBe('desc');
    sort.sort(suma);
    expect(sort.direction()).toBe('asc');
    sort.sort(suma);
    // disableClear: the unsorted state is skipped.
    expect(sort.direction()).toBe('desc');
  });

  it('skips the unsorted state when the container has disableClear', async () => {
    const { sort, host, fixture } = await render();
    const nume = sortable('nume');

    host.disableClear.set(true);
    await fixture.whenStable();
    sort.register(nume);

    sort.sort(nume);
    sort.sort(nume);
    sort.sort(nume);
    expect(sort.direction()).toBe('asc');
  });

  it('restarts the cycle when a different column is sorted', async () => {
    const { sort } = await render();
    const nume = sortable('nume');
    const suma = sortable('suma', 'desc');

    sort.register(nume);
    sort.register(suma);
    sort.sort(nume);
    sort.sort(nume);
    expect(sort.direction()).toBe('desc');

    sort.sort(suma);
    expect(sort.active()).toBe('suma');
    expect(sort.direction()).toBe('desc');
    expect(sort.getNextSortDirection(nume)).toBe('asc');
  });

  it('reflects externally bound active and direction', async () => {
    const { sort, host, fixture } = await render();
    const nume = sortable('nume');

    sort.register(nume);
    host.active.set('nume');
    host.direction.set('desc');
    await fixture.whenStable();

    expect(sort.active()).toBe('nume');
    expect(sort.getNextSortDirection(nume)).toBe('');
  });

  it('ignores sort() while disabled and emits nothing', async () => {
    const { sort, host, fixture } = await render();
    const nume = sortable('nume');

    sort.register(nume);
    host.disabled.set(true);
    await fixture.whenStable();

    sort.sort(nume);
    expect(sort.active()).toBe('');
    expect(host.changes).toEqual([]);
  });

  it('tracks registered sortables by id and forgets them on deregister', async () => {
    const { sort } = await render();
    const nume = sortable('nume');

    sort.register(nume);
    expect(sort.sortables.get('nume')).toBe(nume);

    sort.deregister(nume);
    expect(sort.sortables.has('nume')).toBe(false);
  });

  it('throws in dev mode on an empty or duplicate id', async () => {
    const { sort } = await render();

    expect(() => sort.register(sortable(''))).toThrowError(/needs an id/);

    sort.register(sortable('nume'));
    expect(() => sort.register(sortable('nume'))).toThrowError(/share the id "nume"/);
  });

  it('emits initialized once ngOnInit has run, replaying for late subscribers', async () => {
    const { sort } = await render();
    let count = 0;

    sort.initialized.subscribe(() => (count += 1));
    expect(count).toBe(1);
  });
});
