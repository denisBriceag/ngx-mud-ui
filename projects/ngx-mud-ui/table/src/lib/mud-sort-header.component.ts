import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { CdkColumnDef } from '@angular/cdk/table';
import { MudSort } from './mud-sort.directive';
import type { MudSortable } from './mud-sort.directive';
import { MudStyleLoader } from 'ngx-mud-ui/core';
import { _MudTableStyles } from './mud-table-styles.component';

let nextUniqueId = 0;

const missingSort = (): never => {
  throw Error('[mud-sort-header] must be placed within a parent element with the mudSort directive.');
};

/**
 * ```html
 * <th mud-header-cell *mudHeaderCellDef mud-sort-header>Nume</th>
 * <th mud-header-cell *mudHeaderCellDef mud-sort-header="valoare" start="desc" disableClear>Suma</th>
 * ```
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[mud-sort-header]',
  exportAs: 'mudSortHeader',
  template: `
    <button
      type="button"
      class="mud-sort-header__button"
      [disabled]="_effectiveDisabled()"
      [attr.aria-describedby]="_describedBy()"
      (click)="_handleClick()"
    >
      <span class="mud-sort-header__label"><ng-content /></span>
      @if (!_effectiveDisabled()) {
        @switch (_state()) {
          @case ('asc') {
            <svg class="mud-sort-header__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3.217 13.35c.31.31.812.31 1.122 0l5.122-5.122a.76.76 0 0 1 1.078 0l5.122 5.122a.793.793 0 0 0 1.122-1.122L11.66 7.106a2.35 2.35 0 0 0-3.322 0l-5.122 5.122a.793.793 0 0 0 0 1.122z" />
            </svg>
          }
          @case ('desc') {
            <svg class="mud-sort-header__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3.217 6.65a.793.793 0 0 1 1.122 0l5.122 5.122a.76.76 0 0 0 1.078 0L15.66 6.65a.793.793 0 0 1 1.122 1.122l-5.122 5.122a2.35 2.35 0 0 1-3.322 0L3.217 7.772a.793.793 0 0 1 0-1.122" />
            </svg>
          }
          @default {
            <svg class="mud-sort-header__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M10.136 9.47a.75.75 0 1 1 1.06 1.06l-2.312 2.313a1.25 1.25 0 0 1-1.767 0l-2.314-2.312a.75.75 0 0 1 1.06-1.06L8 11.605zm-2.925-6.4a1.25 1.25 0 0 1 1.579 0l.094.087 2.313 2.313a.75.75 0 1 1-1.06 1.06L7.998 4.395 5.864 6.531a.75.75 0 0 1-1.06-1.06l2.313-2.314z" />
            </svg>
          }
        }
      }
    </button>
    @if (!_effectiveDisabled()) {
      <span class="mud-sort-header__description" [id]="_descriptionId">{{ sortActionDescription() }}</span>
    }
  `,
  host: {
    class: 'mud-sort-header',
    '[class.mud-sort-header--sorted]': '_sorted()',
    '[class.mud-sort-header--disabled]': '_effectiveDisabled()',
    '[attr.aria-sort]': '_ariaSort()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudSortHeader implements MudSortable, OnInit, OnDestroy {
  private readonly _sort = inject(MudSort, { optional: true }) ?? missingSort();
  private readonly _columnDef = inject(CdkColumnDef, { optional: true });
  private readonly _sortId = signal('');

  protected readonly _descriptionId = `mud-sort-header-description-${String(nextUniqueId++)}`;

  /** @description Key reported as `active` when this column is sorted; defaults to the enclosing mudColumnDef name, so set it only when the sort key differs from the column. */
  readonly id = input('', { alias: 'mud-sort-header' });
  /** @description First-click direction for this column ('asc' or 'desc'); overrides the container's `start`, e.g. `start="desc"` on an amount column. */
  readonly start = input<'asc' | 'desc' | undefined>(undefined);
  /** @description Removes the unsorted step for this column only (asc → desc → asc); overrides the container's `disableClear`. */
  readonly disableClear = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  /** @description Makes this header non-sortable: the button renders disabled, without chevron or aria-sort. The container's `disabled` disables it too. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** @description Visually hidden text screen readers announce after the header label (default 'Sort'); translate it, e.g. 'Sortează'. */
  readonly sortActionDescription = input('Sort');

  /** The id this header is registered under. */
  readonly sortId = this._sortId.asReadonly();

  protected readonly _effectiveDisabled = computed(() => this.disabled() || this._sort.disabled());
  protected readonly _describedBy = computed(() => (this._effectiveDisabled() ? null : this._descriptionId));
  protected readonly _sorted = computed(
    () => this._sort.active() === this._sortId() && this._sort.direction() !== '' && this._sortId() !== '',
  );
  protected readonly _state = computed(() => (this._sorted() ? this._sort.direction() : ''));
  protected readonly _ariaSort = computed(() => {
    if (this._effectiveDisabled()) {
      return null;
    }

    if (!this._sorted()) {
      return 'none';
    }

    return this._sort.direction() === 'asc' ? 'ascending' : 'descending';
  });

  constructor() {
    inject(MudStyleLoader).load(_MudTableStyles);
  }

  ngOnInit(): void {
    this._sortId.set(this.id() || this._columnDef?.name || '');
    this._sort.register(this);
  }

  ngOnDestroy(): void {
    this._sort.deregister(this);
  }

  protected _handleClick(): void {
    if (this._effectiveDisabled()) {
      return;
    }

    this._sort.sort(this);
  }
}
