import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { formatTime, isSelectable, minutesForStep, minuteStepTransform, parseTime, toValidTimeOrUndefined } from './time-core';
import type { MudMinuteStep, MudTimeValue } from './time-core';
import { injectMudLabels } from 'ngx-mud-ui/i18n';

export type MudTimePickerAppearance = 'elevated' | 'flat';
export type MudTimePickerColumn = 'hours' | 'minutes';

const HOURS: readonly number[] = Array.from({ length: 24 }, (_, i) => i);

/** Rows visible at once (Figma 13810:9451); the columns scroll the rest. */
const VISIBLE_ROWS = 7;

/**
 * ```html
 * <mud-time-picker [(value)]="time" min="09:00" max="17:00" />
 * ```
 */
@Component({
  selector: 'mud-time-picker',
  templateUrl: './mud-time-picker.component.html',
  styleUrl: './mud-time-picker.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_hostClasses()',
    '[attr.role]': 'appearance() === "flat" ? null : "group"',
    '[attr.aria-label]': 'appearance() === "flat" ? null : _labels().picker',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudTimePicker {
  /** @description Selected time, `HH:MM`. Set once an hour AND a minute are picked. */
  readonly value = model<MudTimeValue>(null);

  /** @description Earliest selectable time, `HH:MM` inclusive. */
  readonly min = input<string | undefined>(undefined);

  /** @description Latest selectable time, `HH:MM` inclusive. */
  readonly max = input<string | undefined>(undefined);

  /** @description `flat` drops the card shadow, for a picker inside your own surface. */
  readonly appearance = input<MudTimePickerAppearance>('elevated');

  /** @description Minute granularity: only these minutes are rendered and accepted. */
  readonly minuteStep = input<MudMinuteStep, unknown>(1, { transform: minuteStepTransform('mud-time-picker') });

  /** @description Return `true` for a SELECTABLE time. Runs after min/max and minuteStep. */
  readonly timeFilter = input<((time: string) => boolean) | undefined>(undefined);

  private readonly _allLabels = injectMudLabels();
  protected readonly _labels = computed(() => this._allLabels().timePicker);

  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly _columns: readonly MudTimePickerColumn[] = ['hours', 'minutes'];
  protected readonly _separatorRows: readonly number[] = Array.from({ length: VISIBLE_ROWS }, (_, i) => i);

  private readonly _minTime = computed(() => toValidTimeOrUndefined(this.min()));
  private readonly _maxTime = computed(() => toValidTimeOrUndefined(this.max()));

  /** Hour half of the selection: written by a pick, reset by an external `value`. */
  protected readonly _hours = linkedSignal<MudTimeValue, number | null>({
    source: this.value,
    computation: (value, previous) =>
      previous && previous.source === value ? previous.value : (parseTime(value)?.hours ?? null),
  });

  protected readonly _minutes = linkedSignal<MudTimeValue, number | null>({
    source: this.value,
    computation: (value, previous) =>
      previous && previous.source === value ? previous.value : (parseTime(value)?.minutes ?? null),
  });

  /** The column being edited: its selection is solid, the other's is tinted. */
  protected readonly _activeColumn = signal<MudTimePickerColumn>('hours');

  private readonly _focusedHour = signal<number | null>(null);
  private readonly _focusedMinute = signal<number | null>(null);

  private readonly _minuteOptions = computed(() => minutesForStep(this.minuteStep()));

  private readonly _constraints = computed(() => ({
    min: this._minTime(),
    max: this._maxTime(),
    minuteStep: this.minuteStep(),
    timeFilter: this.timeFilter(),
  }));

  /** Hours with no selectable rendered minute. */
  private readonly _disabledHours = computed<ReadonlySet<number>>(() => {
    const constraints = this._constraints();
    const minutes = this._minuteOptions();
    const out = new Set<number>();

    for (const h of HOURS) {
      if (!minutes.some((m) => isSelectable(formatTime(h, m), constraints))) out.add(h);
    }

    return out;
  });

  /** Minutes not selectable for the chosen hour; while no hour is chosen, minutes no hour can select. */
  private readonly _disabledMinutes = computed<ReadonlySet<number>>(() => {
    const constraints = this._constraints();
    const hours = this._hours();
    const out = new Set<number>();

    for (const m of this._minuteOptions()) {
      const selectable =
        hours === null
          ? HOURS.some((h) => isSelectable(formatTime(h, m), constraints))
          : isSelectable(formatTime(hours, m), constraints);

      if (!selectable) out.add(m);
    }

    return out;
  });

  protected readonly _hourTabStop = computed(() => this._tabStop('hours'));
  protected readonly _minuteTabStop = computed(() => this._tabStop('minutes'));

  protected readonly _hostClasses = computed(() =>
    ['time-picker', `time-picker--${this.appearance()}`].join(' '),
  );

  constructor() {
    // Open with each selected value at the top of its column (Figma 13810:9450).
    afterNextRender(() => this._scrollSelectedToTop());
  }

  /** Moves focus onto the active column's tab stop. */
  focus(): void {
    if (!this._isBrowser) return;

    const column = this._activeColumn();

    this._option(column, this._tabStop(column))?.focus();
  }

  protected _options(column: MudTimePickerColumn): readonly number[] {
    return column === 'hours' ? HOURS : this._minuteOptions();
  }

  protected _selected(column: MudTimePickerColumn): number | null {
    return column === 'hours' ? this._hours() : this._minutes();
  }

  protected _tabStopOf(column: MudTimePickerColumn): number {
    return column === 'hours' ? this._hourTabStop() : this._minuteTabStop();
  }

  protected _isDisabled(column: MudTimePickerColumn, n: number): boolean {
    if (!this._options(column).includes(n)) return true;

    return (column === 'hours' ? this._disabledHours() : this._disabledMinutes()).has(n);
  }

  protected _pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  protected _pick(column: MudTimePickerColumn, n: number): void {
    if (this._isDisabled(column, n)) return;

    if (column === 'hours') {
      this._hours.set(n);
      this._focusedHour.set(n);

      // A minute the new hour puts out of bounds cannot stay selected.
      const minutes = this._minutes();

      if (minutes !== null && this._isDisabled('minutes', minutes)) this._minutes.set(null);

      // First pass moves on to the minutes; re-editing a complete time stays
      // on the hour just picked instead of pulling focus away.
      if (this._minutes() === null) this._editColumn('minutes');
      else this._activeColumn.set('hours');

      return;
    }

    this._minutes.set(n);
    this._focusedMinute.set(n);

    const hours = this._hours();

    if (hours === null) {
      this._editColumn('hours');

      return;
    }

    this.value.set(formatTime(hours, n));
  }

  protected _onOptionFocus(column: MudTimePickerColumn, n: number): void {
    this._activeColumn.set(column);

    if (column === 'hours') this._focusedHour.set(n);
    else this._focusedMinute.set(n);
  }

  /** Bound on each listbox; the option under the event is the one that acts. */
  protected _onKeydown(event: KeyboardEvent, column: MudTimePickerColumn): void {
    const option = (event.target as HTMLElement | null)?.closest<HTMLElement>('[role="option"]');

    if (!option) return;

    const current = Number(option.dataset['value']);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this._moveFocus(column, this._stepFrom(column, current, 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this._moveFocus(column, this._stepFrom(column, current, -1));
        break;
      case 'Home': {
        event.preventDefault();
        const first = this._nextEnabled(column, -1, 1);

        this._moveFocus(column, first === -1 ? current : first);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = this._nextEnabled(column, this._options(column).length, -1);

        this._moveFocus(column, last === -1 ? current : last);
        break;
      }
      case 'ArrowRight':
        if (column !== 'hours') return;

        event.preventDefault();
        this._editColumn('minutes');
        break;
      case 'ArrowLeft':
        if (column !== 'minutes') return;

        event.preventDefault();
        this._editColumn('hours');
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this._pick(column, current);
        break;
    }
  }

  private _nextEnabled(column: MudTimePickerColumn, fromIndex: number, direction: 1 | -1): number {
    const all = this._options(column);

    for (let i = fromIndex + direction; i >= 0 && i < all.length; i += direction) {
      if (!this._isDisabled(column, all[i])) return all[i];
    }

    return -1;
  }

  private _stepFrom(column: MudTimePickerColumn, value: number, direction: 1 | -1): number {
    const next = this._nextEnabled(column, this._options(column).indexOf(value), direction);

    return next === -1 ? value : next;
  }

  private _tabStop(column: MudTimePickerColumn): number {
    const focused = column === 'hours' ? this._focusedHour() : this._focusedMinute();
    const selected = this._selected(column);

    if (focused !== null && !this._isDisabled(column, focused)) return focused;

    if (selected !== null && !this._isDisabled(column, selected)) return selected;

    return this._nextEnabled(column, -1, 1);
  }

  /** Makes `column` the one being edited and focuses its tab stop after render. */
  private _editColumn(column: MudTimePickerColumn): void {
    this._activeColumn.set(column);

    if (column === 'hours') this._focusedHour.set(this._tabStop('hours'));
    else this._focusedMinute.set(this._tabStop('minutes'));

    this._focusAfterRender(column);
  }

  private _moveFocus(column: MudTimePickerColumn, n: number): void {
    if (column === 'hours') this._focusedHour.set(n);
    else this._focusedMinute.set(n);

    this._focusAfterRender(column);
  }

  private _option(column: MudTimePickerColumn, n: number): HTMLElement | null {
    return this._host.nativeElement.querySelector<HTMLElement>(
      `[data-column="${column}"] [role="option"][data-value="${n}"]`,
    );
  }

  private _focusAfterRender(column: MudTimePickerColumn): void {
    afterNextRender(
      () => {
        const option = this._host.nativeElement.querySelector<HTMLElement>(
          `[data-column="${column}"] [role="option"][tabindex="0"]`,
        );

        option?.focus();
        option?.scrollIntoView?.({ block: 'nearest' });
      },
      { injector: this._injector },
    );
  }

  private _scrollSelectedToTop(): void {
    for (const column of this._columns) {
      const selected = this._selected(column);

      if (selected === null) continue;

      const list = this._host.nativeElement.querySelector<HTMLElement>(`[data-column="${column}"]`);
      const option = this._option(column, selected);

      if (list && option) list.scrollTop = option.offsetTop;
    }
  }
}
