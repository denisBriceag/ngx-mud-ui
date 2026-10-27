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

  /** @description Id of the sorted column ('' = unsorted); two-way bindable. */
  readonly active = model('');
  /** @description Direction of the active column: 'asc', 'desc' or ''; two-way bindable. */
  readonly direction = model<MudSortDirection>('');
  /** @description First-click direction for every column; a header's own `start` overrides it. */
  readonly start = input<'asc' | 'desc'>('asc');
  /** @description Removes the unsorted step from the click cycle; a header's own `disableClear` overrides it. */
  readonly disableClear = input(false, { transform: booleanAttribute });
  /** @description Disables every sort header at once. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Fires after every sort header click with `{ active, direction }`. */
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
