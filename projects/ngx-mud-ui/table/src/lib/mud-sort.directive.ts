import { booleanAttribute, Directive, input, model, output } from '@angular/core';
import type { OnDestroy, OnInit, Signal } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import type { Observable } from 'rxjs';

declare const ngDevMode: boolean | undefined;

export type MudSortDirection = 'asc' | 'desc' | '';

export interface MudSortState {
  active: string;
  direction: MudSortDirection;
}

/** What a sortable header exposes to its `mudSort` container. */
export interface MudSortable {
  readonly sortId: Signal<string>;
  readonly start: Signal<'asc' | 'desc' | undefined>;
  readonly disableClear: Signal<boolean | undefined>;
}

/**
 * ```html
 * <table mud-table mudSort [(active)]="sortBy" [(direction)]="sortDir" (sortChange)="reload($event)">
 * ```
 */
@Directive({
  selector: '[mudSort]',
  exportAs: 'mudSort',
  host: { class: 'mud-sort' },
})
export class MudSort implements OnInit, OnDestroy {
  private readonly _initialized = new ReplaySubject<void>(1);

  readonly sortables = new Map<string, MudSortable>();
  /** Emits once the inputs are bound; MudTableDataSource waits on it before its first sort. */
  readonly initialized: Observable<void> = this._initialized.asObservable();

  /** @description Id of the column currently sorted ('' = unsorted). Two-way bindable, e.g. to restore a saved sort or drive it from the URL. */
  readonly active = model('');
  /** @description Direction of the active column: 'asc', 'desc' or '' (unsorted). Two-way bindable alongside `active`. */
  readonly direction = model<MudSortDirection>('');
  /** @description Direction the first click lands on for every column ('asc' default); use 'desc' when the useful order is biggest/newest first. A header's own `start` overrides it. */
  readonly start = input<'asc' | 'desc'>('asc');
  /** @description Removes the unsorted step from the click cycle (asc → desc → asc), so the table is always sorted; use it when the backend requires a sort or the data has no natural order. A header's own `disableClear` overrides it. */
  readonly disableClear = input(false, { transform: booleanAttribute });
  /** @description Disables every sort header at once (loading or read-only states); each header renders a disabled button without a chevron. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Fires after every click on a sort header with `{ active, direction }`; handle it yourself for server-side sorting, or hand the directive to a MudTableDataSource. */
  readonly sortChange = output<MudSortState>();

  register(sortable: MudSortable): void {
    const id = sortable.sortId();

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!id) {
        throw Error(
          '[mudSort] a sort header needs an id: pass mud-sort-header="key" or place it inside a mudColumnDef.',
        );
      }

      if (this.sortables.has(id)) {
        throw Error(`[mudSort] two sort headers share the id "${id}".`);
      }
    }

    this.sortables.set(id, sortable);
  }

  deregister(sortable: MudSortable): void {
    this.sortables.delete(sortable.sortId());
  }

  /** Advances the state for `sortable` and emits `sortChange`. */
  sort(sortable: MudSortable): void {
    if (this.disabled()) {
      return;
    }

    const id = sortable.sortId();

    if (this.active() !== id) {
      this.active.set(id);
      this.direction.set(sortable.start() ?? this.start());
    } else {
      this.direction.set(this.getNextSortDirection(sortable));
    }

    this.sortChange.emit({ active: this.active(), direction: this.direction() });
  }

  getNextSortDirection(sortable: MudSortable): MudSortDirection {
    const cycle = directionCycle(sortable.start() ?? this.start(), sortable.disableClear() ?? this.disableClear());
    const current = this.active() === sortable.sortId() ? this.direction() : '';
    const next = cycle.indexOf(current) + 1;

    return cycle[next >= cycle.length ? 0 : next];
  }

  ngOnInit(): void {
    this._initialized.next();
  }

  ngOnDestroy(): void {
    this._initialized.complete();
  }
}

function directionCycle(start: 'asc' | 'desc', disableClear: boolean): MudSortDirection[] {
  const cycle: MudSortDirection[] = start === 'asc' ? ['asc', 'desc'] : ['desc', 'asc'];

  if (!disableClear) {
    cycle.push('');
  }

  return cycle;
}
